export type ScreenName = "home" | "download" | "format" | "quality" | "subtitle" | "confirm" | "progress" | "playlist" | "history" | "settings" | "update" | "about";
export type MediaFormat = "mp4" | "mp3" | "webm" | "mkv" | "m4a";
export type Quality = "2160p" | "1440p" | "1080p" | "720p" | "480p" | "360p" | "best" | "worst";
export type SubtitleMode = "none" | "auto" | "manual" | "all";
export type HistoryStatus = "completed" | "failed" | "cancelled";
export interface AppConfig {
    downloadDir: string;
    defaultFormat: MediaFormat;
    defaultQuality: Quality;
    filenameTemplate: string;
    concurrentDownloads: number;
    subtitleLanguage: string;
    checkUpdatesOnStartup: boolean;
    lastUpdateCheck?: string | undefined;
    latestVersion?: string | undefined;
}
export interface HistoryEntry {
    title: string;
    url: string;
    format: MediaFormat;
    quality: Quality;
    date: string;
    filePath: string;
    status: HistoryStatus;
}
export interface VideoFormat {
    formatId: string;
    ext: string;
    height?: number;
    vcodec?: string;
    acodec?: string;
}
export interface VideoMetadata {
    id: string;
    title: string;
    webpageUrl: string;
    channel?: string;
    durationSeconds?: number;
    viewCount?: number;
    thumbnail?: string;
    uploadDate?: string;
    formats: VideoFormat[];
}
export interface PlaylistItem {
    index: number;
    id: string;
    title: string;
    url: string;
    durationSeconds?: number;
    selected: boolean;
}
export interface PlaylistMetadata {
    id: string;
    title: string;
    webpageUrl: string;
    itemCount: number;
    totalDurationSeconds?: number;
    items: PlaylistItem[];
}
export type UrlProbe = {
    kind: "video";
    metadata: VideoMetadata;
} | {
    kind: "playlist";
    playlist: PlaylistMetadata;
};
export interface DownloadSelection {
    url: string;
    metadata: VideoMetadata;
    format: MediaFormat;
    quality: Quality;
    subtitleMode: SubtitleMode;
    subtitleLanguage: string;
    downloadDir: string;
    filenameTemplate: string;
    playlistItems?: PlaylistItem[];
}
export interface DownloadProgress {
    percent: number;
    percentLabel: string;
    speed: string;
    eta: string;
    downloaded: string;
    total: string;
    step: DownloadStep;
}
export type DownloadStep = "idle" | "downloadingVideo" | "downloadingAudio" | "merging" | "embeddingSubtitles" | "completed";
export type DownloadStatus = "idle" | "loading" | "ready" | "downloading" | "completed" | "failed";
export interface ToolVersions {
    ytdlp: string;
    ffmpeg: string;
}
export interface UpdateCheckResult {
    checked: boolean;
    available: boolean;
    latestVersion?: string;
    error?: string;
}
export interface ReleaseInfo {
    tagName: string;
    name: string;
    body: string;
    htmlUrl: string;
}
export interface MenuItem<TValue extends string> {
    label: string;
    value: TValue;
    detail?: string | undefined;
    disabled?: boolean | undefined;
}
