import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { ensureDirectory, getConfigDir, getHistoryPath } from "./paths.js";
const historyEntrySchema = z.object({
    title: z.string(),
    url: z.string(),
    format: z.enum(["mp4", "mp3", "webm", "mkv", "m4a"]),
    quality: z.enum(["2160p", "1440p", "1080p", "720p", "480p", "360p", "best", "worst"]),
    date: z.string(),
    filePath: z.string(),
    status: z.enum(["completed", "failed", "cancelled"])
});
const historySchema = z.array(historyEntrySchema);
export const readHistory = async () => {
    await ensureDirectory(getConfigDir());
    try {
        const raw = await readFile(getHistoryPath(), "utf8");
        const parsed = JSON.parse(raw);
        return historySchema.parse(parsed);
    }
    catch {
        await writeHistory([]);
        return [];
    }
};
export const writeHistory = async (entries) => {
    await ensureDirectory(getConfigDir());
    const validated = historySchema.parse(entries);
    await writeFile(getHistoryPath(), `${JSON.stringify(validated, null, 2)}\n`, "utf8");
};
export const addHistoryEntry = async (entry) => {
    const current = await readHistory();
    const next = [entry, ...current];
    await writeHistory(next);
    return next;
};
export const deleteHistoryEntry = async (entryDate) => {
    const current = await readHistory();
    const next = current.filter((entry) => entry.date !== entryDate);
    await writeHistory(next);
    return next;
};
//# sourceMappingURL=history.js.map