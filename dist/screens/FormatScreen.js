import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import VideoInfoCard from "../components/VideoInfoCard.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function FormatScreen({ version, update, metadata, availableFormats, onSelect, onBack }) {
    const values = ["mp4", "mp3", "webm", "mkv", "m4a"];
    const items = [
        ...values.map((format) => ({
            label: en.format.labels[format],
            value: format,
            disabled: !availableFormats.includes(format),
            detail: availableFormats.includes(format) ? undefined : en.common.unavailable
        })),
        { label: en.common.back, value: "back" }
    ];
    return (_jsxs(InkBox, { flexDirection: "column", children: [_jsx(Header, { title: en.screen.format, version: version, update: update }), _jsx(VideoInfoCard, { metadata: metadata }), _jsxs(InkBox, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { color: theme.colors.textPrimary, children: en.format.prompt }), _jsx(Menu, { items: items, onSelect: (value) => {
                            if (value === "back") {
                                onBack();
                            }
                            else {
                                onSelect(value);
                            }
                        } })] }), _jsx(StatusBar, {})] }));
}
//# sourceMappingURL=FormatScreen.js.map