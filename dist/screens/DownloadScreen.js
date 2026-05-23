import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import Spinner from "ink-spinner";
import TextInput from "ink-text-input";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function DownloadScreen({ version, update, url, status, error, onUrlChange, onSubmit, onBack }) {
    const loading = status === "loading";
    return (_jsxs(InkBox, { flexDirection: "column", children: [_jsx(Header, { title: en.screen.download, version: version, update: update }), _jsx(Text, { color: theme.colors.textPrimary, children: en.download.title }), _jsxs(InkBox, { children: [_jsxs(Text, { color: theme.colors.primary, children: [en.symbols.pointer, " "] }), _jsx(TextInput, { value: url, onChange: onUrlChange, onSubmit: onSubmit, focus: !loading && process.stdin.isTTY === true })] }), _jsx(Text, { color: theme.colors.textMuted, children: en.common.pasteHint }), loading && (_jsxs(Text, { color: theme.colors.textSecondary, children: [_jsx(Spinner, { type: "dots" }), " ", en.download.loadingMetadata] })), error !== null && _jsx(Text, { color: theme.colors.error, children: error }), _jsx(InkBox, { marginTop: 1, children: _jsx(Menu, { items: [{ label: en.common.back, value: "back" }], onSelect: onBack, isActive: !loading }) }), _jsx(StatusBar, { message: en.common.inputHint })] }));
}
//# sourceMappingURL=DownloadScreen.js.map