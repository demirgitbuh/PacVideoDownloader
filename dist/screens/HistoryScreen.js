import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import TextInput from "ink-text-input";
import { useMemo, useState } from "react";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function HistoryScreen({ version, update, entries, error, onRedownload, onOpenLocation, onCopyUrl, onDelete, onBack }) {
    const [filter, setFilter] = useState("");
    const [newestFirst, setNewestFirst] = useState(true);
    const [activeDate, setActiveDate] = useState(null);
    const activeEntry = entries.find((entry) => entry.date === activeDate) ?? null;
    const filteredEntries = useMemo(() => {
        const normalized = filter.trim().toLowerCase();
        const visible = normalized.length === 0 ? entries : entries.filter((entry) => entry.title.toLowerCase().includes(normalized) || entry.url.toLowerCase().includes(normalized));
        return [...visible].sort((left, right) => (newestFirst ? right.date.localeCompare(left.date) : left.date.localeCompare(right.date)));
    }, [entries, filter, newestFirst]);
    const items = [
        { label: newestFirst ? en.history.newest : en.history.oldest, value: "sort" },
        ...filteredEntries.map((entry) => ({
            label: entry.title,
            value: entry.date,
            detail: `${entry.format} ${entry.quality} ${entry.status}`
        })),
        { label: en.common.back, value: "back" }
    ];
    const actionItems = [
        { label: en.history.reDownload, value: "redownload" },
        { label: en.history.openLocation, value: "open" },
        { label: en.history.copyUrl, value: "copy" },
        { label: en.history.delete, value: "delete" },
        { label: en.common.back, value: "back" }
    ];
    return (_jsxs(InkBox, { flexDirection: "column", children: [_jsx(Header, { title: en.screen.history, version: version, update: update }), _jsx(Text, { color: theme.colors.textPrimary, children: en.history.filter }), _jsxs(InkBox, { children: [_jsxs(Text, { color: theme.colors.primary, children: [en.symbols.pointer, " "] }), _jsx(TextInput, { value: filter, onChange: setFilter, focus: activeEntry === null && process.stdin.isTTY === true })] }), error !== null && _jsx(Text, { color: theme.colors.error, children: error }), filteredEntries.length === 0 && _jsx(Text, { color: theme.colors.textMuted, children: en.history.noMatches }), activeEntry === null ? (_jsx(Menu, { items: items, onSelect: (value) => {
                    if (value === "sort") {
                        setNewestFirst((current) => !current);
                    }
                    else if (value === "back") {
                        onBack();
                    }
                    else {
                        setActiveDate(value);
                    }
                } })) : (_jsxs(InkBox, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { color: theme.colors.textPrimary, children: activeEntry.title }), _jsx(Text, { color: theme.colors.textSecondary, children: activeEntry.url }), _jsxs(Text, { color: theme.colors.textSecondary, children: [en.history.status, ": ", activeEntry.status] }), _jsx(Menu, { items: actionItems, onSelect: (value) => {
                            if (value === "redownload") {
                                onRedownload(activeEntry.url);
                            }
                            else if (value === "open") {
                                onOpenLocation(activeEntry.filePath);
                            }
                            else if (value === "copy") {
                                onCopyUrl(activeEntry.url);
                            }
                            else if (value === "delete") {
                                onDelete(activeEntry.date);
                                setActiveDate(null);
                            }
                            else {
                                setActiveDate(null);
                            }
                        } })] })), _jsx(StatusBar, {})] }));
}
//# sourceMappingURL=HistoryScreen.js.map