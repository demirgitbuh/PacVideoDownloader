const progressPrefix = "download:";
export const parseProgressLine = (line) => {
    if (!line.startsWith(progressPrefix)) {
        return null;
    }
    const payload = line.slice(progressPrefix.length);
    const [percentTextRaw, speedRaw, etaRaw, downloadedRaw, totalRaw] = payload.split("|");
    const percentText = (percentTextRaw ?? "").trim();
    const percentNumber = Number(percentText.replace("%", "").trim());
    const percent = Number.isFinite(percentNumber) ? Math.max(0, Math.min(100, percentNumber)) : 0;
    return {
        percent,
        percentLabel: percentText.length > 0 ? percentText : "0%",
        speed: (speedRaw ?? "").trim(),
        eta: (etaRaw ?? "").trim(),
        downloaded: (downloadedRaw ?? "").trim(),
        total: (totalRaw ?? "").trim(),
        step: "downloadingVideo"
    };
};
export const inferDownloadStep = (line, current) => {
    const normalized = line.toLowerCase();
    if (normalized.includes("merging formats") || normalized.includes("merge")) {
        return "merging";
    }
    if (normalized.includes("embedding subtitles") || normalized.includes("subtitle")) {
        return "embeddingSubtitles";
    }
    if (normalized.includes("audio")) {
        return "downloadingAudio";
    }
    if (normalized.includes("download")) {
        return "downloadingVideo";
    }
    return current;
};
//# sourceMappingURL=progress.js.map