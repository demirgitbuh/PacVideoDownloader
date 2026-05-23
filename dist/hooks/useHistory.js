import { useCallback, useEffect, useState } from "react";
import { addHistoryEntry, deleteHistoryEntry, readHistory } from "../lib/history.js";
const messageFromError = (error) => (error instanceof Error ? error.message : String(error));
export default function useHistory() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setEntries(await readHistory());
        }
        catch (caughtError) {
            setError(messageFromError(caughtError));
        }
        finally {
            setLoading(false);
        }
    }, []);
    const addEntry = useCallback(async (entry) => {
        setError(null);
        try {
            setEntries(await addHistoryEntry(entry));
        }
        catch (caughtError) {
            setError(messageFromError(caughtError));
        }
    }, []);
    const deleteEntry = useCallback(async (entryDate) => {
        setError(null);
        try {
            setEntries(await deleteHistoryEntry(entryDate));
        }
        catch (caughtError) {
            setError(messageFromError(caughtError));
        }
    }, []);
    useEffect(() => {
        void reload();
    }, [reload]);
    return { entries, loading, error, reload, addEntry, deleteEntry };
}
//# sourceMappingURL=useHistory.js.map