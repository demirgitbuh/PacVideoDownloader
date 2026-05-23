import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import TextInput from "ink-text-input";
import { useState } from "react";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
const formats = ["mp4", "mp3", "webm", "mkv", "m4a"];
const qualities = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "best", "worst"];
const nextValue = (values, current) => values[(values.indexOf(current) + 1) % values.length] ?? values[0] ?? current;
export default function SettingsScreen({ version, update, config, error, onUpdate, onReset, onBack }) {
    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState("");
    const [localError, setLocalError] = useState(null);
    const startEdit = (key, value) => {
        setEditing(key);
        setDraft(value);
        setLocalError(null);
    };
    const submitEdit = (value) => {
        const trimmed = value.trim();
        if (editing === "downloadDir" && trimmed.length === 0) {
            setLocalError(en.validation.pathRequired);
            return;
        }
        if (editing === "subtitleLanguage" && trimmed.length === 0) {
            setLocalError(en.validation.languageRequired);
            return;
        }
        if (editing === "concurrentDownloads") {
            const concurrentDownloads = Number.parseInt(trimmed, 10);
            if (!Number.isFinite(concurrentDownloads) || concurrentDownloads < 1 || concurrentDownloads > 5) {
                setLocalError(en.validation.concurrentRange);
                return;
            }
            void onUpdate({ concurrentDownloads });
            setEditing(null);
            return;
        }
        if (editing !== null) {
            void onUpdate({ [editing]: trimmed });
            setEditing(null);
        }
    };
    const items = [
        { label: `${en.settings.labels.downloadDir}: ${config.downloadDir}`, value: "downloadDir" },
        { label: `${en.settings.labels.defaultFormat}: ${en.format.labels[config.defaultFormat]}`, value: "format" },
        { label: `${en.settings.labels.defaultQuality}: ${en.quality.labels[config.defaultQuality]}`, value: "quality" },
        { label: `${en.settings.labels.filenameTemplate}: ${config.filenameTemplate}`, value: "filenameTemplate" },
        { label: `${en.settings.labels.concurrentDownloads}: ${config.concurrentDownloads.toString()}`, value: "concurrentDownloads" },
        { label: `${en.settings.labels.subtitleLanguage}: ${config.subtitleLanguage}`, value: "subtitleLanguage" },
        { label: `${en.settings.labels.checkUpdatesOnStartup}: ${config.checkUpdatesOnStartup ? en.common.enabled : en.common.disabled}`, value: "updates" },
        { label: en.settings.reset, value: "reset" },
        { label: en.common.back, value: "back" }
    ];
    return (_jsxs(InkBox, { flexDirection: "column", children: [_jsx(Header, { title: en.screen.settings, version: version, update: update }), editing === null ? (_jsx(Menu, { items: items, onSelect: (value) => {
                    if (value === "downloadDir") {
                        startEdit(value, config.downloadDir);
                    }
                    else if (value === "filenameTemplate") {
                        startEdit(value, config.filenameTemplate);
                    }
                    else if (value === "concurrentDownloads") {
                        startEdit(value, config.concurrentDownloads.toString());
                    }
                    else if (value === "subtitleLanguage") {
                        startEdit(value, config.subtitleLanguage);
                    }
                    else if (value === "format") {
                        void onUpdate({ defaultFormat: nextValue(formats, config.defaultFormat) });
                    }
                    else if (value === "quality") {
                        void onUpdate({ defaultQuality: nextValue(qualities, config.defaultQuality) });
                    }
                    else if (value === "updates") {
                        void onUpdate({ checkUpdatesOnStartup: !config.checkUpdatesOnStartup });
                    }
                    else if (value === "reset") {
                        void onReset();
                    }
                    else {
                        onBack();
                    }
                } })) : (_jsxs(InkBox, { flexDirection: "column", children: [_jsxs(Text, { color: theme.colors.textPrimary, children: [en.settings.edit, ": ", en.settings.labels[editing]] }), _jsxs(InkBox, { children: [_jsxs(Text, { color: theme.colors.primary, children: [en.symbols.pointer, " "] }), _jsx(TextInput, { value: draft, onChange: setDraft, onSubmit: submitEdit, focus: process.stdin.isTTY === true })] })] })), localError !== null && _jsx(Text, { color: theme.colors.error, children: localError }), error !== null && _jsx(Text, { color: theme.colors.error, children: error }), _jsx(StatusBar, { message: editing === null ? en.common.keyHint : en.common.inputHint })] }));
}
//# sourceMappingURL=SettingsScreen.js.map