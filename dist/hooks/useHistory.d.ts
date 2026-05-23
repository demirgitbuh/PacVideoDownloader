import type { HistoryEntry } from "../types/index.js";
interface UseHistoryResult {
    entries: HistoryEntry[];
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    addEntry: (entry: HistoryEntry) => Promise<void>;
    deleteEntry: (entryDate: string) => Promise<void>;
}
export default function useHistory(): UseHistoryResult;
export {};
