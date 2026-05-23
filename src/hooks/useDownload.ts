import { useCallback, useMemo, useState } from "react";
import type {
  AppConfig,
  DownloadProgress,
  DownloadSelection,
  DownloadStatus,
  HistoryEntry,
  MediaFormat,
  PlaylistItem,
  PlaylistMetadata,
  Quality,
  SubtitleMode,
  UrlProbe,
  VideoMetadata
} from "../types/index.js";
import {
  computeFilenamePreview,
  getAvailableFormats,
  getAvailableQualities,
  isAudioFormat,
  loadVideoMetadata,
  probeUrl,
  startYtDlpDownload
} from "../lib/ytdlp.js";
import { en } from "../locales/en.js";

interface UseDownloadResult {
  url: string;
  status: DownloadStatus;
  error: string | null;
  metadata: VideoMetadata | null;
  playlist: PlaylistMetadata | null;
  selectedPlaylistItems: PlaylistItem[];
  selectedFormat: MediaFormat | null;
  selectedQuality: Quality | null;
  selectedSubtitleMode: SubtitleMode;
  filenamePreview: string | null;
  progress: DownloadProgress;
  logLines: string[];
  completedFilePath: string | null;
  availableFormats: MediaFormat[];
  availableQualities: Array<{ quality: Quality; available: boolean }>;
  setUrl: (url: string) => void;
  setFormat: (format: MediaFormat) => void;
  setQuality: (quality: Quality) => void;
  setSubtitleMode: (mode: SubtitleMode) => void;
  resetFlow: () => void;
  loadUrl: (url: string) => Promise<UrlProbe | null>;
  preparePlaylistItems: (items: PlaylistItem[]) => Promise<boolean>;
  loadPreview: (config: AppConfig) => Promise<void>;
  startDownload: (config: AppConfig, onHistory: (entry: HistoryEntry) => Promise<void>) => Promise<void>;
}

const initialProgress: DownloadProgress = {
  percent: 0,
  percentLabel: "0%",
  speed: "",
  eta: "",
  downloaded: "",
  total: "",
  step: "idle"
};

const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

const messageFromError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const createSelection = (
  url: string,
  metadata: VideoMetadata | null,
  selectedFormat: MediaFormat | null,
  selectedQuality: Quality | null,
  selectedSubtitleMode: SubtitleMode,
  selectedPlaylistItems: PlaylistItem[],
  config: AppConfig
): DownloadSelection | null => {
  if (metadata === null || selectedFormat === null || selectedQuality === null) {
    return null;
  }

  return {
    url,
    metadata,
    format: selectedFormat,
    quality: selectedQuality,
    subtitleMode: isAudioFormat(selectedFormat) ? "none" : selectedSubtitleMode,
    subtitleLanguage: config.subtitleLanguage,
    downloadDir: config.downloadDir,
    filenameTemplate: config.filenameTemplate,
    ...(selectedPlaylistItems.length > 0 ? { playlistItems: selectedPlaylistItems } : {})
  };
};

export default function useDownload(): UseDownloadResult {
  const [url, setUrlState] = useState("");
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistMetadata | null>(null);
  const [selectedPlaylistItems, setSelectedPlaylistItems] = useState<PlaylistItem[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<Quality | null>(null);
  const [selectedSubtitleMode, setSelectedSubtitleMode] = useState<SubtitleMode>("none");
  const [filenamePreview, setFilenamePreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress>(initialProgress);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [completedFilePath, setCompletedFilePath] = useState<string | null>(null);

  const availableFormats = useMemo(() => (metadata === null ? [] : getAvailableFormats(metadata)), [metadata]);
  const availableQualities = useMemo(
    () => (metadata === null || selectedFormat === null ? [] : getAvailableQualities(metadata, selectedFormat)),
    [metadata, selectedFormat]
  );

  const setUrl = useCallback((nextUrl: string): void => {
    setUrlState(nextUrl);
    setError(null);
  }, []);

  const resetSelections = useCallback((): void => {
    setSelectedFormat(null);
    setSelectedQuality(null);
    setSelectedSubtitleMode("none");
    setFilenamePreview(null);
    setProgress(initialProgress);
    setLogLines([]);
    setCompletedFilePath(null);
  }, []);

  const resetFlow = useCallback((): void => {
    setUrlState("");
    setStatus("idle");
    setError(null);
    setMetadata(null);
    setPlaylist(null);
    setSelectedPlaylistItems([]);
    resetSelections();
  }, [resetSelections]);

  const loadUrl = useCallback(
    async (nextUrl: string): Promise<UrlProbe | null> => {
      const trimmed = nextUrl.trim();

      if (trimmed.length === 0) {
        setError(en.validation.urlRequired);
        return null;
      }

      if (!urlPattern.test(trimmed)) {
        setError(en.validation.invalidUrl);
        return null;
      }

      setUrlState(trimmed);
      setStatus("loading");
      setError(null);
      setMetadata(null);
      setPlaylist(null);
      setSelectedPlaylistItems([]);
      resetSelections();

      try {
        const probe = await probeUrl(trimmed);

        if (probe.kind === "video") {
          setMetadata(probe.metadata);
          setStatus("ready");
          return probe;
        }

        setPlaylist(probe.playlist);
        setSelectedPlaylistItems(probe.playlist.items);
        setStatus("ready");
        return probe;
      } catch (caughtError) {
        setStatus("failed");
        setError(messageFromError(caughtError));
        return null;
      }
    },
    [resetSelections]
  );

  const preparePlaylistItems = useCallback(
    async (items: PlaylistItem[]): Promise<boolean> => {
      if (items.length === 0) {
        setError(en.playlist.selectedCount(0));
        return false;
      }

      setStatus("loading");
      setError(null);
      resetSelections();
      setSelectedPlaylistItems(items);

      try {
        const firstItem = items[0];
        if (firstItem === undefined) {
          setError(en.playlist.selectedCount(0));
          setStatus("failed");
          return false;
        }

        const nextMetadata = await loadVideoMetadata(firstItem.url);
        setMetadata(nextMetadata);
        setStatus("ready");
        return true;
      } catch (caughtError) {
        setStatus("failed");
        setError(messageFromError(caughtError));
        return false;
      }
    },
    [resetSelections]
  );

  const setFormat = useCallback((format: MediaFormat): void => {
    setSelectedFormat(format);
    setSelectedQuality(null);
    setFilenamePreview(null);
  }, []);

  const setQuality = useCallback((quality: Quality): void => {
    setSelectedQuality(quality);
    setFilenamePreview(null);
  }, []);

  const setSubtitleMode = useCallback((mode: SubtitleMode): void => {
    setSelectedSubtitleMode(mode);
    setFilenamePreview(null);
  }, []);

  const loadPreview = useCallback(
    async (config: AppConfig): Promise<void> => {
      const selection = createSelection(url, metadata, selectedFormat, selectedQuality, selectedSubtitleMode, selectedPlaylistItems, config);

      if (selection === null) {
        return;
      }

      setStatus("loading");
      setError(null);

      try {
        setFilenamePreview(await computeFilenamePreview(selection));
        setStatus("ready");
      } catch (caughtError) {
        setStatus("failed");
        setError(messageFromError(caughtError));
      }
    },
    [metadata, selectedFormat, selectedPlaylistItems, selectedQuality, selectedSubtitleMode, url]
  );

  const startDownload = useCallback(
    async (config: AppConfig, onHistory: (entry: HistoryEntry) => Promise<void>): Promise<void> => {
      const selection = createSelection(url, metadata, selectedFormat, selectedQuality, selectedSubtitleMode, selectedPlaylistItems, config);

      if (selection === null) {
        setError(en.confirm.prompt);
        return;
      }

      setStatus("downloading");
      setError(null);
      setProgress(initialProgress);
      setLogLines([]);

      const fallbackFilePath = filenamePreview ?? config.downloadDir;

      try {
        await startYtDlpDownload(
          selection,
          (nextProgress) => setProgress(nextProgress),
          (line) => setLogLines((current) => [...current.slice(-8), line])
        );
        setStatus("completed");
        setProgress({ ...initialProgress, percent: 100, percentLabel: "100%", step: "completed" });
        setCompletedFilePath(fallbackFilePath);
        await onHistory({
          title: selection.metadata.title,
          url: selection.url,
          format: selection.format,
          quality: selection.quality,
          date: new Date().toISOString(),
          filePath: fallbackFilePath,
          status: "completed"
        });
      } catch (caughtError) {
        setStatus("failed");
        setError(messageFromError(caughtError));
        await onHistory({
          title: selection.metadata.title,
          url: selection.url,
          format: selection.format,
          quality: selection.quality,
          date: new Date().toISOString(),
          filePath: fallbackFilePath,
          status: "failed"
        });
      }
    },
    [filenamePreview, metadata, selectedFormat, selectedPlaylistItems, selectedQuality, selectedSubtitleMode, url]
  );

  return {
    url,
    status,
    error,
    metadata,
    playlist,
    selectedPlaylistItems,
    selectedFormat,
    selectedQuality,
    selectedSubtitleMode,
    filenamePreview,
    progress,
    logLines,
    completedFilePath,
    availableFormats,
    availableQualities,
    setUrl,
    setFormat,
    setQuality,
    setSubtitleMode,
    resetFlow,
    loadUrl,
    preparePlaylistItems,
    loadPreview,
    startDownload
  };
}
