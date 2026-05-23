import type { DownloadProgress, DownloadStatus, UpdateCheckResult } from "../types/index.js";
interface ProgressScreenProps {
    version: string;
    update: UpdateCheckResult;
    status: DownloadStatus;
    progress: DownloadProgress;
    error: string | null;
    logLines: string[];
    completedFilePath: string | null;
    onOpenFolder: () => void;
    onDownloadAnother: () => void;
    onHome: () => void;
}
export default function ProgressScreen({ version, update, status, progress, error, logLines, completedFilePath, onOpenFolder, onDownloadAnother, onHome }: ProgressScreenProps): JSX.Element;
export {};
