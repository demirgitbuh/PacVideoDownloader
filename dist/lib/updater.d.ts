import type { AppConfig, ReleaseInfo, UpdateCheckResult } from "../types/index.js";
export declare const compareSemver: (left: string, right: string) => number;
export declare const fetchLatestRelease: (repo: string) => Promise<ReleaseInfo>;
export declare const fetchLatestNpmVersion: () => Promise<string>;
export declare const checkPacvUpdate: (config: AppConfig, currentVersion: string) => Promise<UpdateCheckResult>;
export declare const readPackageVersion: (projectRoot: string) => Promise<string>;
export declare const runManualUpdate: (currentVersion: string, projectRoot: string) => Promise<number>;
