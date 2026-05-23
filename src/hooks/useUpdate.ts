import { useCallback, useEffect, useState } from "react";
import type { AppConfig, UpdateCheckResult } from "../types/index.js";
import { checkPacvUpdate, compareSemver, fetchLatestNpmVersion } from "../lib/updater.js";
import { en } from "../locales/en.js";
import { patchConfig } from "../lib/config.js";

interface UseUpdateResult {
  update: UpdateCheckResult;
  checking: boolean;
  checkNow: () => Promise<void>;
}

const idleUpdate: UpdateCheckResult = { checked: false, available: false };
const messageFromError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export default function useUpdate(config: AppConfig | null, currentVersion: string): UseUpdateResult {
  const [update, setUpdate] = useState<UpdateCheckResult>(idleUpdate);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (config === null || !config.checkUpdatesOnStartup) {
      return;
    }

    let active = true;
    setChecking(true);

    void checkPacvUpdate(config, currentVersion)
      .then((result) => {
        if (active) {
          setUpdate(result);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setUpdate({ checked: true, available: false, error: messageFromError(error) });
        }
      })
      .finally(() => {
        if (active) {
          setChecking(false);
        }
      });

    return () => {
      active = false;
    };
  }, [config, currentVersion]);

  const checkNow = useCallback(async (): Promise<void> => {
    setChecking(true);

    try {
      const latestVersion = await fetchLatestNpmVersion();
      await patchConfig({ lastUpdateCheck: new Date().toISOString(), latestVersion });
      setUpdate({
        checked: true,
        available: compareSemver(currentVersion, latestVersion) < 0,
        latestVersion
      });
    } catch (caughtError) {
      setUpdate({ checked: true, available: false, error: `${en.update.failed}: ${messageFromError(caughtError)}` });
    } finally {
      setChecking(false);
    }
  }, [currentVersion]);

  return { update, checking, checkNow };
}
