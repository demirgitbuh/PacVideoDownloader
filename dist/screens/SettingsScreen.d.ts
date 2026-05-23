import type { AppConfig, UpdateCheckResult } from "../types/index.js";
interface SettingsScreenProps {
    version: string;
    update: UpdateCheckResult;
    config: AppConfig;
    error: string | null;
    onUpdate: (patch: Partial<AppConfig>) => Promise<void>;
    onReset: () => Promise<void>;
    onBack: () => void;
}
export default function SettingsScreen({ version, update, config, error, onUpdate, onReset, onBack }: SettingsScreenProps): JSX.Element;
export {};
