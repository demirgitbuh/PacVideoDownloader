import type { DownloadStatus, UpdateCheckResult } from "../types/index.js";
interface DownloadScreenProps {
    version: string;
    update: UpdateCheckResult;
    url: string;
    status: DownloadStatus;
    error: string | null;
    onUrlChange: (value: string) => void;
    onSubmit: (value: string) => void;
    onBack: () => void;
}
export default function DownloadScreen({ version, update, url, status, error, onUrlChange, onSubmit, onBack }: DownloadScreenProps): JSX.Element;
export {};
