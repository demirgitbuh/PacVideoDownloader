import type { HistoryEntry } from "../types/index.js";
export declare const readHistory: () => Promise<HistoryEntry[]>;
export declare const writeHistory: (entries: HistoryEntry[]) => Promise<void>;
export declare const addHistoryEntry: (entry: HistoryEntry) => Promise<HistoryEntry[]>;
export declare const deleteHistoryEntry: (entryDate: string) => Promise<HistoryEntry[]>;
