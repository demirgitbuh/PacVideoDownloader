import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { ensureDirectory, getConfigDir, getConfigPath, getDefaultDownloadDir } from "./paths.js";
const mediaFormatSchema = z.enum(["mp4", "mp3", "webm", "mkv", "m4a"]);
const qualitySchema = z.enum(["2160p", "1440p", "1080p", "720p", "480p", "360p", "best", "worst"]);
const appConfigSchema = z.object({
    downloadDir: z.string().min(1),
    defaultFormat: mediaFormatSchema,
    defaultQuality: qualitySchema,
    filenameTemplate: z.string().min(1),
    concurrentDownloads: z.number().int().min(1).max(5),
    subtitleLanguage: z.string().min(2).max(12),
    checkUpdatesOnStartup: z.boolean(),
    lastUpdateCheck: z.string().optional(),
    latestVersion: z.string().optional()
});
export const createDefaultConfig = () => ({
    downloadDir: getDefaultDownloadDir(),
    defaultFormat: "mp4",
    defaultQuality: "best",
    filenameTemplate: "%(title)s.%(ext)s",
    concurrentDownloads: 2,
    subtitleLanguage: "en",
    checkUpdatesOnStartup: true
});
export const readConfig = async () => {
    await ensureDirectory(getConfigDir());
    const configPath = getConfigPath();
    try {
        const raw = await readFile(configPath, "utf8");
        const parsed = JSON.parse(raw);
        return appConfigSchema.parse({ ...createDefaultConfig(), ...(typeof parsed === "object" && parsed !== null ? parsed : {}) });
    }
    catch {
        const defaults = createDefaultConfig();
        await writeConfig(defaults);
        return defaults;
    }
};
export const writeConfig = async (config) => {
    await ensureDirectory(getConfigDir());
    const validated = appConfigSchema.parse(config);
    await writeFile(getConfigPath(), `${JSON.stringify(validated, null, 2)}\n`, "utf8");
};
export const patchConfig = async (patch) => {
    const current = await readConfig();
    const next = appConfigSchema.parse({ ...current, ...patch });
    await writeConfig(next);
    return next;
};
export const resetConfig = async () => {
    const defaults = createDefaultConfig();
    await writeConfig(defaults);
    return defaults;
};
//# sourceMappingURL=config.js.map