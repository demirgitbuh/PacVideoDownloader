import { useCallback, useEffect, useState } from "react";
import { patchConfig, readConfig, resetConfig } from "../lib/config.js";
const messageFromError = (error) => (error instanceof Error ? error.message : String(error));
export default function useConfig() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setConfig(await readConfig());
        }
        catch (caughtError) {
            setError(messageFromError(caughtError));
        }
        finally {
            setLoading(false);
        }
    }, []);
    const updateConfig = useCallback(async (patch) => {
        setError(null);
        try {
            setConfig(await patchConfig(patch));
        }
        catch (caughtError) {
            setError(messageFromError(caughtError));
        }
    }, []);
    const reset = useCallback(async () => {
        setError(null);
        try {
            setConfig(await resetConfig());
        }
        catch (caughtError) {
            setError(messageFromError(caughtError));
        }
    }, []);
    useEffect(() => {
        void reload();
    }, [reload]);
    return { config, loading, error, reload, updateConfig, reset };
}
//# sourceMappingURL=useConfig.js.map