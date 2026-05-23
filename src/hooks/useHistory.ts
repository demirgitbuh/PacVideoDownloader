import { useCallback, useEffect, useState } from "react";
import type { HistoryEntry } from "../types/index.js";
import { addHistoryEntry, deleteHistoryEntry, readHistory } from "../lib/history.js";

interface UseHistoryResult {
  entries: HistoryEntry[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addEntry: (entry: HistoryEntry) => Promise<void>;
  deleteEntry: (entryDate: string) => Promise<void>;
}

const messageFromError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export default function useHistory(): UseHistoryResult {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      setEntries(await readHistory());
    } catch (caughtError) {
      setError(messageFromError(caughtError));
    } finally {
      setLoading(false);
    }
  }, []);

  const addEntry = useCallback(async (entry: HistoryEntry): Promise<void> => {
    setError(null);

    try {
      setEntries(await addHistoryEntry(entry));
    } catch (caughtError) {
      setError(messageFromError(caughtError));
    }
  }, []);

  const deleteEntry = useCallback(async (entryDate: string): Promise<void> => {
    setError(null);

    try {
      setEntries(await deleteHistoryEntry(entryDate));
    } catch (caughtError) {
      setError(messageFromError(caughtError));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { entries, loading, error, reload, addEntry, deleteEntry };
}
