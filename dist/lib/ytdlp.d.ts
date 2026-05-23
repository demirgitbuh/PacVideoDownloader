import type { DownloadProgress, DownloadSelection, MediaFormat, Quality, ToolVersions, UrlProbe, VideoMetadata } from "../types/index.js";
export declare const probeUrl: (url: string) => Promise<UrlProbe>;
export declare const loadVideoMetadata: (url: string) => Promise<VideoMetadata>;
export declare const isAudioFormat: (format: MediaFormat) => boolean;
export declare const getAvailableFormats: (metadata: VideoMetadata) => MediaFormat[];
export declare const getAvailableQualities: (metadata: VideoMetadata, format: MediaFormat) => Array<{
    quality: Quality;
    available: boolean;
}>;
export declare const formatDuration: (seconds: number | undefined) => string;
export declare const formatViewCount: (value: number | undefined) => string;
export declare const buildDownloadArgs: (selection: DownloadSelection) => string[];
export declare const computeFilenamePreview: (selection: DownloadSelection) => Promise<string>;
export declare const startYtDlpDownload: (selection: DownloadSelection, onProgress: (progress: DownloadProgress) => void, onLine: (line: string) => void) => Promise<void>;
export declare const getToolVersions: () => Promise<ToolVersions>;
export declare const openContainingFolder: (filePath: string) => Promise<void>;
export declare const copyToClipboard: (value: string) => Promise<void>;
