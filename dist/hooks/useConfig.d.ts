import type { AppConfig } from "../types/index.js";
interface UseConfigResult {
    config: AppConfig | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
    updateConfig: (patch: Partial<AppConfig>) => Promise<void>;
    reset: () => Promise<void>;
}
export default function useConfig(): UseConfigResult;
export {};
