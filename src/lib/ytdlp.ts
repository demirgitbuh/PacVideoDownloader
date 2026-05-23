import { execa } from "execa";
import { createInterface } from "node:readline";
import path from "node:path";
import type {
  DownloadProgress,
  DownloadSelection,
  MediaFormat,
  PlaylistItem,
  PlaylistMetadata,
  Quality,
  SubtitleMode,
  ToolVersions,
  UrlProbe,
  VideoFormat,
  VideoMetadata
} from "../types/index.js";
import { en } from "../locales/en.js";
import { ensureDirectory, expandTilde, getManagedBinaryDir, getVendorBinaryDir, pathExists } from "./paths.js";
import { inferDownloadStep, parseProgressLine } from "./progress.js";

const progressTemplate =
  "download:%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s|%(progress._downloaded_bytes_str)s|%(progress._total_bytes_str)s";

const formats: readonly MediaFormat[] = ["mp4", "mp3", "webm", "mkv", "m4a"];
const qualities: readonly Quality[] = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "best", "worst"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (record: Record<string, unknown>, key: string): string | undefined => {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

const getNumber = (record: Record<string, unknown>, key: string): number | undefined => {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

const getArray = (record: Record<string, unknown>, key: string): unknown[] => {
  const value = record[key];
  return Array.isArray(value) ? value : [];
};

const errorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const binaryName = (baseName: string): string => (process.platform === "win32" ? `${baseName}.exe` : baseName);

const resolveBinary = async (baseName: string): Promise<string> => {
  const executableName = binaryName(baseName);
  const managedPath = path.join(getManagedBinaryDir(), executableName);
  if (await pathExists(managedPath)) {
    return managedPath;
  }

  const vendorPath = path.join(getVendorBinaryDir(import.meta.url), executableName);
  if (await pathExists(vendorPath)) {
    return vendorPath;
  }

  return baseName;
};

const resolveYtDlp = async (): Promise<string> => resolveBinary("yt-dlp");

const resolveFfmpegLocation = async (): Promise<string | null> => {
  const ffmpegPath = await resolveBinary("ffmpeg");
  return path.isAbsolute(ffmpegPath) ? path.dirname(ffmpegPath) : null;
};

const withFfmpegLocation = async (args: string[]): Promise<string[]> => {
  const ffmpegLocation = await resolveFfmpegLocation();
  return ffmpegLocation === null ? args : ["--ffmpeg-location", ffmpegLocation, ...args];
};

const parseVideoFormat = (value: unknown): VideoFormat | null => {
  if (!isRecord(value)) {
    return null;
  }

  const ext = getString(value, "ext");
  const formatId = getString(value, "format_id");

  if (ext === undefined || formatId === undefined) {
    return null;
  }

  const height = getNumber(value, "height");
  const vcodec = getString(value, "vcodec");
  const acodec = getString(value, "acodec");

  return {
    formatId,
    ext,
    ...(height !== undefined ? { height } : {}),
    ...(vcodec !== undefined ? { vcodec } : {}),
    ...(acodec !== undefined ? { acodec } : {})
  };
};

const parseVideoMetadata = (value: unknown, fallbackUrl: string): VideoMetadata => {
  if (!isRecord(value)) {
    throw new Error(en.download.loadFailed);
  }

  const id = getString(value, "id") ?? "video";
  const title = getString(value, "title") ?? en.common.unknown;
  const webpageUrl = getString(value, "webpage_url") ?? fallbackUrl;
  const channel = getString(value, "channel") ?? getString(value, "uploader");
  const durationSeconds = getNumber(value, "duration");
  const viewCount = getNumber(value, "view_count");
  const thumbnail = getString(value, "thumbnail");
  const uploadDate = getString(value, "upload_date");
  const parsedFormats = getArray(value, "formats").map(parseVideoFormat).filter((format): format is VideoFormat => format !== null);

  return {
    id,
    title,
    webpageUrl,
    formats: parsedFormats,
    ...(channel !== undefined ? { channel } : {}),
    ...(durationSeconds !== undefined ? { durationSeconds } : {}),
    ...(viewCount !== undefined ? { viewCount } : {}),
    ...(thumbnail !== undefined ? { thumbnail } : {}),
    ...(uploadDate !== undefined ? { uploadDate } : {})
  };
};

const parsePlaylistMetadata = (value: unknown, fallbackUrl: string): PlaylistMetadata | null => {
  if (!isRecord(value)) {
    return null;
  }

  const type = getString(value, "_type");
  const entries = getArray(value, "entries");

  if (type !== "playlist" || entries.length === 0) {
    return null;
  }

  const title = getString(value, "title") ?? en.common.unknown;
  const webpageUrl = getString(value, "webpage_url") ?? fallbackUrl;
  const items: PlaylistItem[] = entries
    .map((entry, itemIndex): PlaylistItem | null => {
      if (!isRecord(entry)) {
        return null;
      }

      const id = getString(entry, "id") ?? `${itemIndex + 1}`;
      const itemTitle = getString(entry, "title") ?? `${en.common.unknown} ${itemIndex + 1}`;
      const itemUrl = getString(entry, "webpage_url") ?? getString(entry, "url") ?? webpageUrl;
      const durationSeconds = getNumber(entry, "duration");

      return {
        index: itemIndex + 1,
        id,
        title: itemTitle,
        url: itemUrl,
        selected: true,
        ...(durationSeconds !== undefined ? { durationSeconds } : {})
      };
    })
    .filter((item): item is PlaylistItem => item !== null);

  const totalDuration = items.reduce<number | undefined>((total, item) => {
    if (item.durationSeconds === undefined) {
      return total;
    }

    return (total ?? 0) + item.durationSeconds;
  }, undefined);

  return {
    id: getString(value, "id") ?? "playlist",
    title,
    webpageUrl,
    itemCount: items.length,
    items,
    ...(totalDuration !== undefined ? { totalDurationSeconds: totalDuration } : {})
  };
};

const runYtDlpJson = async (args: readonly string[]): Promise<unknown> => {
  try {
    const result = await execa(await resolveYtDlp(), [...args], { reject: true });
    return JSON.parse(result.stdout) as unknown;
  } catch (error) {
    throw new Error(`${en.download.loadFailed} ${errorMessage(error)}`);
  }
};

export const probeUrl = async (url: string): Promise<UrlProbe> => {
  const flat = await runYtDlpJson(["--dump-single-json", "--flat-playlist", url]);
  const playlist = parsePlaylistMetadata(flat, url);

  if (playlist !== null) {
    return { kind: "playlist", playlist };
  }

  const metadata = await loadVideoMetadata(url);
  return { kind: "video", metadata };
};

export const loadVideoMetadata = async (url: string): Promise<VideoMetadata> => {
  const metadata = await runYtDlpJson(["--dump-single-json", "--no-playlist", url]);
  return parseVideoMetadata(metadata, url);
};

export const isAudioFormat = (format: MediaFormat): boolean => format === "mp3" || format === "m4a";

export const getAvailableFormats = (metadata: VideoMetadata): MediaFormat[] => {
  const hasVideo = metadata.formats.some((format) => format.vcodec !== undefined && format.vcodec !== "none");
  const hasAudio = metadata.formats.some((format) => format.acodec !== undefined && format.acodec !== "none");
  const extensions = new Set(metadata.formats.map((format) => format.ext.toLowerCase()));

  return formats.filter((format) => {
    if (format === "mp3") {
      return hasAudio;
    }

    if (format === "m4a") {
      return hasAudio && (extensions.has("m4a") || extensions.has("mp4"));
    }

    if (format === "mkv") {
      return hasVideo;
    }

    return hasVideo && extensions.has(format);
  });
};

export const getAvailableQualities = (metadata: VideoMetadata, format: MediaFormat): Array<{ quality: Quality; available: boolean }> => {
  const heights = new Set(metadata.formats.map((videoFormat) => videoFormat.height).filter((height): height is number => height !== undefined));

  return qualities.map((quality) => {
    if (quality === "best" || quality === "worst" || isAudioFormat(format)) {
      return { quality, available: quality === "best" || quality === "worst" };
    }

    const targetHeight = Number.parseInt(quality, 10);
    return { quality, available: heights.has(targetHeight) };
  });
};

export const formatDuration = (seconds: number | undefined): string => {
  if (seconds === undefined) {
    return en.common.unknown;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const parts = hours > 0 ? [hours, minutes, remainingSeconds] : [minutes, remainingSeconds];
  return parts.map((part) => part.toString().padStart(2, "0")).join(":");
};

export const formatViewCount = (value: number | undefined): string => {
  if (value === undefined) {
    return en.common.unknown;
  }

  return new Intl.NumberFormat("en-US").format(value);
};

const qualitySelector = (quality: Quality, format: MediaFormat): string => {
  if (isAudioFormat(format)) {
    return quality === "worst" ? "worstaudio/worst" : "bestaudio/best";
  }

  if (quality === "best") {
    return "bestvideo*+bestaudio/best";
  }

  if (quality === "worst") {
    return "worstvideo*+worstaudio/worst";
  }

  const targetHeight = Number.parseInt(quality, 10);
  return `bestvideo[height<=${targetHeight}]+bestaudio/best[height<=${targetHeight}]/best`;
};

const formatArgs = (format: MediaFormat): string[] => {
  if (format === "mp3" || format === "m4a") {
    return ["-x", "--audio-format", format];
  }

  return ["--merge-output-format", format];
};

const subtitleArgs = (mode: SubtitleMode, language: string): string[] => {
  if (mode === "none") {
    return [];
  }

  if (mode === "auto") {
    return ["--write-auto-subs", "--sub-langs", language];
  }

  if (mode === "manual") {
    return ["--write-subs", "--sub-langs", language];
  }

  return ["--write-subs", "--write-auto-subs", "--sub-langs", "all"];
};

const playlistArgs = (selection: DownloadSelection): string[] => {
  if (selection.playlistItems === undefined || selection.playlistItems.length === 0) {
    return ["--no-playlist"];
  }

  return ["--playlist-items", selection.playlistItems.map((item) => item.index.toString()).join(",")];
};

export const buildDownloadArgs = (selection: DownloadSelection): string[] => [
  "--newline",
  "--progress-template",
  progressTemplate,
  "-f",
  qualitySelector(selection.quality, selection.format),
  ...formatArgs(selection.format),
  ...subtitleArgs(selection.subtitleMode, selection.subtitleLanguage),
  "-o",
  path.join(expandTilde(selection.downloadDir), selection.filenameTemplate),
  ...playlistArgs(selection),
  selection.url
];

export const computeFilenamePreview = async (selection: DownloadSelection): Promise<string> => {
  const args = [
    "--print",
    "filename",
    "-f",
    qualitySelector(selection.quality, selection.format),
    ...formatArgs(selection.format),
    "-o",
    path.join(expandTilde(selection.downloadDir), selection.filenameTemplate),
    ...playlistArgs(selection),
    selection.url
  ];

  const result = await execa(await resolveYtDlp(), await withFfmpegLocation(args), { reject: true });
  return result.stdout.split("\n").find((line) => line.trim().length > 0)?.trim() ?? path.join(expandTilde(selection.downloadDir), selection.filenameTemplate);
};

export const startYtDlpDownload = async (
  selection: DownloadSelection,
  onProgress: (progress: DownloadProgress) => void,
  onLine: (line: string) => void
): Promise<void> => {
  await ensureDirectory(selection.downloadDir);
  const subprocess = execa(await resolveYtDlp(), await withFfmpegLocation(buildDownloadArgs(selection)), { stdout: "pipe", stderr: "pipe", reject: true });
  let currentStep: DownloadProgress["step"] = "idle";

  const consumeStream = async (stream: NodeJS.ReadableStream | null): Promise<void> => {
    if (stream === null) {
      return;
    }

    const lines = createInterface({ input: stream });
    for await (const line of lines) {
      const text = String(line);
      const parsed = parseProgressLine(text);
      currentStep = inferDownloadStep(text, currentStep);

      if (parsed !== null) {
        onProgress({ ...parsed, step: currentStep });
      } else {
        onLine(text);
      }
    }
  };

  await Promise.all([consumeStream(subprocess.stdout), consumeStream(subprocess.stderr), subprocess]);
};

export const getToolVersions = async (): Promise<ToolVersions> => {
  const ytdlpVersion = await execa(await resolveYtDlp(), ["--version"], { reject: true });
  const ffmpegVersion = await execa(await resolveBinary("ffmpeg"), ["-version"], { reject: true });

  return {
    ytdlp: ytdlpVersion.stdout.split("\n")[0]?.trim() ?? en.common.unknown,
    ffmpeg: ffmpegVersion.stdout.split("\n")[0]?.trim() ?? en.common.unknown
  };
};

export const openContainingFolder = async (filePath: string): Promise<void> => {
  const folder = path.dirname(expandTilde(filePath));

  if (process.platform === "win32") {
    await execa("explorer", [folder]);
    return;
  }

  if (process.platform === "darwin") {
    await execa("open", [folder]);
    return;
  }

  await execa("xdg-open", [folder]);
};

export const copyToClipboard = async (value: string): Promise<void> => {
  if (process.platform === "win32") {
    await execa("clip", { input: value });
    return;
  }

  if (process.platform === "darwin") {
    await execa("pbcopy", { input: value });
    return;
  }

  await execa("xclip", ["-selection", "clipboard"], { input: value });
};
