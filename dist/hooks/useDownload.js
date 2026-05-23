import { useCallback, useMemo, useState } from "react";
import { computeFilenamePreview, getAvailableFormats, getAvailableQualities, isAudioFormat, loadVideoMetadata, probeUrl, startYtDlpDownload } from "../lib/ytdlp.js";
import { en } from "../locales/en.js";
const initialProgress = {
    percent: 0,
    percentLabel: "0%",
    speed: "",
    eta: "",
    downloaded: "",
    total: "",
    step: "idle"
};
const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const messageFromError = (error) => (error instanceof Error ? error.message : String(error));
const createSelection = (url, metadata, selectedFormat, selectedQuality, selectedSubtitleMode, selectedPlaylistItems, config) => {
    if (metadata === null || selectedFormat === null || selectedQuality === null) {
        return null;
    }
    return {
        url,
        metadata,
        format: selectedFormat,
        quality: selectedQuality,
        subtitleMode: isAudioFormat(selectedFormat) ? "none" : selectedSubtitleMode,
        subtitleLanguage: config.subtitleLanguage,
        downloadDir: config.downloadDir,
        filenameTemplate: config.filenameTemplate,
        ...(selectedPlaylistItems.length > 0 ? { playlistItems: selectedPlaylistItems } : {})
    };
};
export default function useDownload() {
    const [url, setUrlState] = useState("");
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [playlist, setPlaylist] = useState(null);
    const [selectedPlaylistItems, setSelectedPlaylistItems] = useState([]);
    const [selectedFormat, setSelectedFormat] = useState(null);
    const [selectedQuality, setSelectedQuality] = useState(null);
    const [selectedSubtitleMode, setSelectedSubtitleMode] = useState("none");
    const [filenamePreview, setFilenamePreview] = useState(null);
    const [progress, setProgress] = useState(initialProgress);
    const [logLines, setLogLines] = useState([]);
    const [completedFilePath, setCompletedFilePath] = useState(null);
    const availableFormats = useMemo(() => (metadata === null ? [] : getAvailableFormats(metadata)), [metadata]);
    const availableQualities = useMemo(() => (metadata === null || selectedFormat === null ? [] : getAvailableQualities(metadata, selectedFormat)), [metadata, selectedFormat]);
    const setUrl = useCallback((nextUrl) => {
        setUrlState(nextUrl);
        setError(null);
    }, []);
    const resetSelections = useCallback(() => {
        setSelectedFormat(null);
        setSelectedQuality(null);
        setSelectedSubtitleMode("none");
        setFilenamePreview(null);
        setProgress(initialProgress);
        setLogLines([]);
        setCompletedFilePath(null);
    }, []);
    const resetFlow = useCallback(() => {
        setUrlState("");
        setStatus("idle");
        setError(null);
        setMetadata(null);
        setPlaylist(null);
        setSelectedPlaylistItems([]);
        resetSelections();
    }, [resetSelections]);
    const loadUrl = useCallback(async (nextUrl) => {
        const trimmed = nextUrl.trim();
        if (trimmed.length === 0) {
            setError(en.validation.urlRequired);
            return null;
        }
        if (!urlPattern.test(trimmed)) {
            setError(en.validation.invalidUrl);
            return null;
        }
        setUrlState(trimmed);
        setStatus("loading");
        setError(null);
        setMetadata(null);
        setPlaylist(null);
        setSelectedPlaylistItems([]);
        resetSelections();
        try {
            const probe = await probeUrl(trimmed);
            if (probe.kind === "video") {
                setMetadata(probe.metadata);
                setStatus("ready");
                return probe;
            }
            setPlaylist(probe.playlist);
            setSelectedPlaylistItems(probe.playlist.items);
            setStatus("ready");
            return probe;
        }
        catch (caughtError) {
            setStatus("failed");
            setError(messageFromError(caughtError));
            return null;
        }
    }, [resetSelections]);
    const preparePlaylistItems = useCallback(async (items) => {
        if (items.length === 0) {
            setError(en.playlist.selectedCount(0));
            return false;
        }
        setStatus("loading");
        setError(null);
        resetSelections();
        setSelectedPlaylistItems(items);
        try {
            const firstItem = items[0];
            if (firstItem === undefined) {
                setError(en.playlist.selectedCount(0));
                setStatus("failed");
                return false;
            }
            const nextMetadata = await loadVideoMetadata(firstItem.url);
            setMetadata(nextMetadata);
            setStatus("ready");
            return true;
        }
        catch (caughtError) {
            setStatus("failed");
            setError(messageFromError(caughtError));
            return false;
        }
    }, [resetSelections]);
    const setFormat = useCallback((format) => {
        setSelectedFormat(format);
        setSelectedQuality(null);
        setFilenamePreview(null);
    }, []);
    const setQuality = useCallback((quality) => {
        setSelectedQuality(quality);
        setFilenamePreview(null);
    }, []);
    const setSubtitleMode = useCallback((mode) => {
        setSelectedSubtitleMode(mode);
        setFilenamePreview(null);
    }, []);
    const loadPreview = useCallback(async (config) => {
        const selection = createSelection(url, metadata, selectedFormat, selectedQuality, selectedSubtitleMode, selectedPlaylistItems, config);
        if (selection === null) {
            return;
        }
        setStatus("loading");
        setError(null);
        try {
            setFilenamePreview(await computeFilenamePreview(selection));
            setStatus("ready");
        }
        catch (caughtError) {
            setStatus("failed");
            setError(messageFromError(caughtError));
        }
    }, [metadata, selectedFormat, selectedPlaylistItems, selectedQuality, selectedSubtitleMode, url]);
    const startDownload = useCallback(async (config, onHistory) => {
        const selection = createSelection(url, metadata, selectedFormat, selectedQuality, selectedSubtitleMode, selectedPlaylistItems, config);
        if (selection === null) {
            setError(en.confirm.prompt);
            return;
        }
        setStatus("downloading");
        setError(null);
        setProgress(initialProgress);
        setLogLines([]);
        const fallbackFilePath = filenamePreview ?? config.downloadDir;
        try {
            await startYtDlpDownload(selection, (nextProgress) => setProgress(nextProgress), (line) => setLogLines((current) => [...current.slice(-8), line]));
            setStatus("completed");
            setProgress({ ...initialProgress, percent: 100, percentLabel: "100%", step: "completed" });
            setCompletedFilePath(fallbackFilePath);
            await onHistory({
                title: selection.metadata.title,
                url: selection.url,
                format: selection.format,
                quality: selection.quality,
                date: new Date().toISOString(),
                filePath: fallbackFilePath,
                status: "completed"
            });
        }
        catch (caughtError) {
            setStatus("failed");
            setError(messageFromError(caughtError));
            await onHistory({
                title: selection.metadata.title,
                url: selection.url,
                format: selection.format,
                quality: selection.quality,
                date: new Date().toISOString(),
                filePath: fallbackFilePath,
                status: "failed"
            });
        }
    }, [filenamePreview, metadata, selectedFormat, selectedPlaylistItems, selectedQuality, selectedSubtitleMode, url]);
    return {
        url,
        status,
        error,
        metadata,
        playlist,
        selectedPlaylistItems,
        selectedFormat,
        selectedQuality,
        selectedSubtitleMode,
        filenamePreview,
        progress,
        logLines,
        completedFilePath,
        availableFormats,
        availableQualities,
        setUrl,
        setFormat,
        setQuality,
        setSubtitleMode,
        resetFlow,
        loadUrl,
        preparePlaylistItems,
        loadPreview,
        startDownload
    };
}
//# sourceMappingURL=useDownload.js.map