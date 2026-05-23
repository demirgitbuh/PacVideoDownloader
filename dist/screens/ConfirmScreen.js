import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import Spinner from "ink-spinner";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import VideoInfoCard from "../components/VideoInfoCard.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function ConfirmScreen({ version, update, config, metadata, format, quality, subtitleMode, filenamePreview, loading, error, onStart, onBack }) {
    return (_jsxs(InkBox, { flexDirection: "column", children: [_jsx(Header, { title: en.screen.confirm, version: version, update: update }), _jsx(VideoInfoCard, { metadata: metadata }), _jsxs(InkBox, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { color: theme.colors.textPrimary, children: en.confirm.prompt }), _jsxs(Text, { color: theme.colors.textSecondary, children: [en.confirm.optionFormat, ": ", en.format.labels[format]] }), _jsxs(Text, { color: theme.colors.textSecondary, children: [en.confirm.optionQuality, ": ", en.quality.labels[quality]] }), _jsxs(Text, { color: theme.colors.textSecondary, children: [en.confirm.optionSubtitles, ": ", en.subtitle.labels[subtitleMode]] }), _jsxs(Text, { color: theme.colors.textSecondary, children: [en.confirm.optionDirectory, ": ", config.downloadDir] }), _jsxs(Text, { color: theme.colors.textSecondary, children: [en.confirm.filenamePreview, ": ", filenamePreview ?? en.common.unknown] })] }), loading && (_jsxs(Text, { color: theme.colors.textSecondary, children: [_jsx(Spinner, { type: "dots" }), " ", en.confirm.recalculating] })), error !== null && _jsx(Text, { color: theme.colors.error, children: error }), _jsx(InkBox, { marginTop: 1, children: _jsx(Menu, { items: [
                        { label: en.confirm.start, value: "start", disabled: loading },
                        { label: en.common.back, value: "back" }
                    ], onSelect: (value) => {
                        if (value === "start") {
                            onStart();
                        }
                        else {
                            onBack();
                        }
                    } }) }), _jsx(StatusBar, {})] }));
}
//# sourceMappingURL=ConfirmScreen.js.map