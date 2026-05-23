import type { DownloadProgress, DownloadStep } from "../types/index.js";
export declare const parseProgressLine: (line: string) => DownloadProgress | null;
export declare const inferDownloadStep: (line: string, current: DownloadStep) => DownloadStep;
