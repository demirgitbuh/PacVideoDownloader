import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useMemo, useState } from "react";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import { formatDuration } from "../lib/ytdlp.js";
const parseRange = (range, items) => {
    const [startRaw, endRaw] = range.split("-");
    const start = Math.max(1, Number.parseInt(startRaw ?? "", 10));
    const end = Math.min(items.length, Number.parseInt(endRaw ?? startRaw ?? "", 10));
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
        return [];
    }
    return items.filter((item) => item.index >= start && item.index <= end);
};
export default function PlaylistScreen({ version, update, playlist, loading, error, onContinue, onBack }) {
    const [mode, setMode] = useState("menu");
    const [range, setRange] = useState("1-10");
    const [cursor, setCursor] = useState(0);
    const [selected, setSelected] = useState(() => new Set(playlist.items.map((item) => item.index)));
    const selectedItems = useMemo(() => playlist.items.filter((item) => selected.has(item.index)).map((item) => ({ ...item, selected: true })), [playlist.items, selected]);
    const visibleItems = playlist.items.slice(Math.max(0, cursor - 4), Math.max(0, cursor - 4) + 8);
    useInput((input, key) => {
        if (mode !== "individual" || loading) {
            return;
        }
        if (key.downArrow) {
            setCursor((current) => Math.min(playlist.items.length - 1, current + 1));
        }
        if (key.upArrow) {
            setCursor((current) => Math.max(0, current - 1));
        }
        if (input === " ") {
            const item = playlist.items[cursor];
            if (item !== undefined) {
                setSelected((current) => {
                    const next = new Set(current);
                    if (next.has(item.index)) {
                        next.delete(item.index);
                    }
                    else {
                        next.add(item.index);
                    }
                    return next;
                });
            }
        }
        if (key.return) {
            onContinue(selectedItems);
        }
        if (key.escape) {
            setMode("menu");
        }
    }, { isActive: mode === "individual" && !loading && process.stdin.isTTY === true });
    const menuItems = [
        { label: en.playlist.all, value: "all" },
        { label: en.playlist.range, value: "range" },
        { label: en.playlist.individual, value: "individual" },
        { label: en.common.back, value: "back" }
    ];
    return (_jsxs(InkBox, { flexDirection: "column", children: [_jsx(Header, { title: en.screen.playlist, version: version, update: update }), _jsx(Text, { color: theme.colors.textPrimary, children: playlist.title }), _jsx(Text, { color: theme.colors.textSecondary, children: en.video.playlistCount(playlist.itemCount) }), _jsx(Text, { color: theme.colors.textSecondary, children: en.video.totalDuration(formatDuration(playlist.totalDurationSeconds)) }), error !== null && _jsx(Text, { color: theme.colors.error, children: error }), mode === "menu" && (_jsx(Menu, { items: menuItems, isActive: !loading, onSelect: (value) => {
                    if (value === "all") {
                        onContinue(playlist.items.map((item) => ({ ...item, selected: true })));
                    }
                    else if (value === "range") {
                        setMode("range");
                    }
                    else if (value === "individual") {
                        setMode("individual");
                    }
                    else {
                        onBack();
                    }
                } })), mode === "range" && (_jsxs(InkBox, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { color: theme.colors.textPrimary, children: en.playlist.rangeInput }), _jsxs(InkBox, { children: [_jsxs(Text, { color: theme.colors.primary, children: [en.symbols.pointer, " "] }), _jsx(TextInput, { value: range, onChange: setRange, onSubmit: (value) => {
                                    onContinue(parseRange(value, playlist.items));
                                }, focus: !loading && process.stdin.isTTY === true })] }), _jsx(Menu, { items: [{ label: en.common.back, value: "back" }], onSelect: () => setMode("menu"), isActive: !loading })] })), mode === "individual" && (_jsxs(InkBox, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { color: theme.colors.textSecondary, children: en.playlist.selectedCount(selectedItems.length) }), visibleItems.map((item) => {
                        const active = playlist.items[cursor]?.index === item.index;
                        return (_jsxs(InkBox, { gap: 1, children: [_jsx(Text, { color: active ? theme.colors.primary : theme.colors.textMuted, children: active ? en.symbols.pointer : " " }), _jsx(Text, { color: selected.has(item.index) ? theme.colors.success : theme.colors.textMuted, children: selected.has(item.index) ? en.symbols.success : en.symbols.empty }), _jsx(Text, { color: theme.colors.textPrimary, children: item.index.toString() }), _jsx(Text, { color: theme.colors.textSecondary, children: item.title })] }, item.index));
                    }), _jsx(Text, { color: theme.colors.textMuted, children: en.playlist.toggleHint })] })), _jsx(StatusBar, {})] }));
}
//# sourceMappingURL=PlaylistScreen.js.map