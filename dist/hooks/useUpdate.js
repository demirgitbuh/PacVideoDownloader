import { useCallback, useEffect, useState } from "react";
import { checkPacvUpdate, compareSemver, fetchLatestNpmVersion } from "../lib/updater.js";
import { en } from "../locales/en.js";
import { patchConfig } from "../lib/config.js";
const idleUpdate = { checked: false, available: false };
const messageFromError = (error) => (error instanceof Error ? error.message : String(error));
export default function useUpdate(config, currentVersion) {
    const [update, setUpdate] = useState(idleUpdate);
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
            .catch((error) => {
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
    const checkNow = useCallback(async () => {
        setChecking(true);
        try {
            const latestVersion = await fetchLatestNpmVersion();
            await patchConfig({ lastUpdateCheck: new Date().toISOString(), latestVersion });
            setUpdate({
                checked: true,
                available: compareSemver(currentVersion, latestVersion) < 0,
                latestVersion
            });
        }
        catch (caughtError) {
            setUpdate({ checked: true, available: false, error: `${en.update.failed}: ${messageFromError(caughtError)}` });
        }
        finally {
            setChecking(false);
        }
    }, [currentVersion]);
    return { update, checking, checkNow };
}
//# sourceMappingURL=useUpdate.js.map