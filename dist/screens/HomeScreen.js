import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import Header from "../components/Header.js";
import Logo from "../components/Logo.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function HomeScreen({ version, downloadDir, update, onNavigate, onQuit }) {
    const items = [
        { label: en.home.menu.download, value: "download" },
        { label: en.home.menu.history, value: "history" },
        { label: en.home.menu.settings, value: "settings" },
        { label: en.home.menu.update, value: "update" },
        { label: en.home.menu.about, value: "about" },
        { label: en.home.menu.quit, value: "quit" }
    ];
    return (_jsxs(InkBox, { flexDirection: "column", children: [_jsx(Header, { title: en.screen.home, version: version, update: update }), _jsx(Logo, {}), _jsx(Text, { color: theme.colors.textSecondary, children: en.app.version(version) }), _jsx(Text, { color: theme.colors.textSecondary, children: en.app.downloadPath(downloadDir) }), _jsx(InkBox, { marginTop: 1, children: _jsx(Menu, { items: items, onSelect: (value) => {
                        if (value === "quit") {
                            onQuit();
                        }
                        else {
                            onNavigate(value);
                        }
                    } }) }), _jsx(StatusBar, {})] }));
}
//# sourceMappingURL=HomeScreen.js.map