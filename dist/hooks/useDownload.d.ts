import type { AppConfig, DownloadProgress, DownloadStatus, HistoryEntry, MediaFormat, PlaylistItem, PlaylistMetadata, Quality, SubtitleMode, UrlProbe, VideoMetadata } from "../types/index.js";
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
    availableQualities: Array<{
        quality: Quality;
        available: boolean;
    }>;
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
export default function useDownload(): UseDownloadResult;
export {};
