import type { AppConfig, UpdateCheckResult } from "../types/index.js";
interface UseUpdateResult {
    update: UpdateCheckResult;
    checking: boolean;
    checkNow: () => Promise<void>;
}
export default function useUpdate(config: AppConfig | null, currentVersion: string): UseUpdateResult;
export {};
