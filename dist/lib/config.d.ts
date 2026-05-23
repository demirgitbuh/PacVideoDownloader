import type { AppConfig } from "../types/index.js";
export declare const createDefaultConfig: () => AppConfig;
export declare const readConfig: () => Promise<AppConfig>;
export declare const writeConfig: (config: AppConfig) => Promise<void>;
export declare const patchConfig: (patch: Partial<AppConfig>) => Promise<AppConfig>;
export declare const resetConfig: () => Promise<AppConfig>;
