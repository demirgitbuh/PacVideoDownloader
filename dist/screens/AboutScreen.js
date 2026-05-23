import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import Spinner from "ink-spinner";
import { useEffect, useState } from "react";
import Header from "../components/Header.js";
import Logo from "../components/Logo.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import { getToolVersions } from "../lib/ytdlp.js";
export default function AboutScreen({ version, update, onBack }) {
    const [tools, setTools] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        let active = true;
        void getToolVersions()
            .then((versions) => {
            if (active) {
                setTools(versions);
            }
        })
            .catch((caughtError) => {
            if (active) {
                setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
            }
        });
        return () => {
            active = false;
        };
    }, []);
    return (_jsxs(InkBox, { flexDirection: "column", children: [_jsx(Header, { title: en.screen.about, version: version, update: update }), _jsx(Logo, {}), _jsx(Text, { color: theme.colors.textPrimary, children: en.app.name }), _jsx(Text, { color: theme.colors.textSecondary, children: en.app.version(version) }), _jsx(Text, { color: theme.colors.textSecondary, children: en.app.github }), _jsx(Text, { color: theme.colors.textSecondary, children: en.app.license }), _jsx(Text, { color: theme.colors.primary, children: en.app.madeBy }), tools === null && error === null && (_jsxs(Text, { color: theme.colors.textSecondary, children: [_jsx(Spinner, { type: "dots" }), " ", en.about.loadingTools] })), tools !== null && (_jsxs(InkBox, { flexDirection: "column", marginTop: 1, children: [_jsxs(Text, { color: theme.colors.textSecondary, children: [en.about.ytdlpVersion, ": ", tools.ytdlp] }), _jsxs(Text, { color: theme.colors.textSecondary, children: [en.about.ffmpegVersion, ": ", tools.ffmpeg] })] })), error !== null && _jsx(Text, { color: theme.colors.warning, children: error }), _jsx(InkBox, { marginTop: 1, children: _jsx(Menu, { items: [{ label: en.common.back, value: "back" }], onSelect: onBack }) }), _jsx(StatusBar, {})] }));
}
//# sourceMappingURL=AboutScreen.js.map