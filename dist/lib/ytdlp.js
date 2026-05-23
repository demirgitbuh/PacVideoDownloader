import { execa } from "execa";
import { createInterface } from "node:readline";
import path from "node:path";
import { en } from "../locales/en.js";
import { ensureDirectory, expandTilde, getManagedBinaryDir, getVendorBinaryDir, pathExists } from "./paths.js";
import { inferDownloadStep, parseProgressLine } from "./progress.js";
const progressTemplate = "download:%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s|%(progress._downloaded_bytes_str)s|%(progress._total_bytes_str)s";
const formats = ["mp4", "mp3", "webm", "mkv", "m4a"];
const qualities = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "best", "worst"];
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const getString = (record, key) => {
    const value = record[key];
    return typeof value === "string" && value.length > 0 ? value : undefined;
};
const getNumber = (record, key) => {
    const value = record[key];
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};
const getArray = (record, key) => {
    const value = record[key];
    return Array.isArray(value) ? value : [];
};
const errorMessage = (error) => (error instanceof Error ? error.message : String(error));
const binaryName = (baseName) => (process.platform === "win32" ? `${baseName}.exe` : baseName);
const resolveBinary = async (baseName) => {
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
const resolveYtDlp = async () => resolveBinary("yt-dlp");
const resolveFfmpegLocation = async () => {
    const ffmpegPath = await resolveBinary("ffmpeg");
    return path.isAbsolute(ffmpegPath) ? path.dirname(ffmpegPath) : null;
};
const withFfmpegLocation = async (args) => {
    const ffmpegLocation = await resolveFfmpegLocation();
    return ffmpegLocation === null ? args : ["--ffmpeg-location", ffmpegLocation, ...args];
};
const parseVideoFormat = (value) => {
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
const parseVideoMetadata = (value, fallbackUrl) => {
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
    const parsedFormats = getArray(value, "formats").map(parseVideoFormat).filter((format) => format !== null);
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
const parsePlaylistMetadata = (value, fallbackUrl) => {
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
    const items = entries
        .map((entry, itemIndex) => {
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
        .filter((item) => item !== null);
    const totalDuration = items.reduce((total, item) => {
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
const runYtDlpJson = async (args) => {
    try {
        const result = await execa(await resolveYtDlp(), [...args], { reject: true });
        return JSON.parse(result.stdout);
    }
    catch (error) {
        throw new Error(`${en.download.loadFailed} ${errorMessage(error)}`);
    }
};
export const probeUrl = async (url) => {
    const flat = await runYtDlpJson(["--dump-single-json", "--flat-playlist", url]);
    const playlist = parsePlaylistMetadata(flat, url);
    if (playlist !== null) {
        return { kind: "playlist", playlist };
    }
    const metadata = await loadVideoMetadata(url);
    return { kind: "video", metadata };
};
export const loadVideoMetadata = async (url) => {
    const metadata = await runYtDlpJson(["--dump-single-json", "--no-playlist", url]);
    return parseVideoMetadata(metadata, url);
};
export const isAudioFormat = (format) => format === "mp3" || format === "m4a";
export const getAvailableFormats = (metadata) => {
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
export const getAvailableQualities = (metadata, format) => {
    const heights = new Set(metadata.formats.map((videoFormat) => videoFormat.height).filter((height) => height !== undefined));
    return qualities.map((quality) => {
        if (quality === "best" || quality === "worst" || isAudioFormat(format)) {
            return { quality, available: quality === "best" || quality === "worst" };
        }
        const targetHeight = Number.parseInt(quality, 10);
        return { quality, available: heights.has(targetHeight) };
    });
};
export const formatDuration = (seconds) => {
    if (seconds === undefined) {
        return en.common.unknown;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const parts = hours > 0 ? [hours, minutes, remainingSeconds] : [minutes, remainingSeconds];
    return parts.map((part) => part.toString().padStart(2, "0")).join(":");
};
export const formatViewCount = (value) => {
    if (value === undefined) {
        return en.common.unknown;
    }
    return new Intl.NumberFormat("en-US").format(value);
};
const qualitySelector = (quality, format) => {
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
const formatArgs = (format) => {
    if (format === "mp3" || format === "m4a") {
        return ["-x", "--audio-format", format];
    }
    return ["--merge-output-format", format];
};
const subtitleArgs = (mode, language) => {
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
const playlistArgs = (selection) => {
    if (selection.playlistItems === undefined || selection.playlistItems.length === 0) {
        return ["--no-playlist"];
    }
    return ["--playlist-items", selection.playlistItems.map((item) => item.index.toString()).join(",")];
};
export const buildDownloadArgs = (selection) => [
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
export const computeFilenamePreview = async (selection) => {
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
export const startYtDlpDownload = async (selection, onProgress, onLine) => {
    await ensureDirectory(selection.downloadDir);
    const subprocess = execa(await resolveYtDlp(), await withFfmpegLocation(buildDownloadArgs(selection)), { stdout: "pipe", stderr: "pipe", reject: true });
    let currentStep = "idle";
    const consumeStream = async (stream) => {
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
            }
            else {
                onLine(text);
            }
        }
    };
    await Promise.all([consumeStream(subprocess.stdout), consumeStream(subprocess.stderr), subprocess]);
};
export const getToolVersions = async () => {
    const ytdlpVersion = await execa(await resolveYtDlp(), ["--version"], { reject: true });
    const ffmpegVersion = await execa(await resolveBinary("ffmpeg"), ["-version"], { reject: true });
    return {
        ytdlp: ytdlpVersion.stdout.split("\n")[0]?.trim() ?? en.common.unknown,
        ffmpeg: ffmpegVersion.stdout.split("\n")[0]?.trim() ?? en.common.unknown
    };
};
export const openContainingFolder = async (filePath) => {
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
export const copyToClipboard = async (value) => {
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
//# sourceMappingURL=ytdlp.js.map