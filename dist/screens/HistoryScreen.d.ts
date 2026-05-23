import type { HistoryEntry, UpdateCheckResult } from "../types/index.js";
interface HistoryScreenProps {
    version: string;
    update: UpdateCheckResult;
    entries: HistoryEntry[];
    error: string | null;
    onRedownload: (url: string) => void;
    onOpenLocation: (filePath: string) => void;
    onCopyUrl: (url: string) => void;
    onDelete: (date: string) => void;
    onBack: () => void;
}
export default function HistoryScreen({ version, update, entries, error, onRedownload, onOpenLocation, onCopyUrl, onDelete, onBack }: HistoryScreenProps): JSX.Element;
export {};
