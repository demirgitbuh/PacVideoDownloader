import { useCallback, useEffect, useState } from "react";
import type { AppConfig } from "../types/index.js";
import { patchConfig, readConfig, resetConfig } from "../lib/config.js";

interface UseConfigResult {
  config: AppConfig | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  updateConfig: (patch: Partial<AppConfig>) => Promise<void>;
  reset: () => Promise<void>;
}

const messageFromError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export default function useConfig(): UseConfigResult {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      setConfig(await readConfig());
    } catch (caughtError) {
      setError(messageFromError(caughtError));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (patch: Partial<AppConfig>): Promise<void> => {
    setError(null);

    try {
      setConfig(await patchConfig(patch));
    } catch (caughtError) {
      setError(messageFromError(caughtError));
    }
  }, []);

  const reset = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      setConfig(await resetConfig());
    } catch (caughtError) {
      setError(messageFromError(caughtError));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { config, loading, error, reload, updateConfig, reset };
}
