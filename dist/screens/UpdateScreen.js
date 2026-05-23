import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import Spinner from "ink-spinner";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function UpdateScreen({ version, update, checking, onCheck, onBack }) {
    const status = update.error !== undefined
        ? `${en.update.failed}: ${update.error}`
        : update.available && update.latestVersion !== undefined
            ? en.update.available(update.latestVersion)
            : update.checked
                ? en.update.upToDate
                : en.update.manualHint;
    return (_jsxs(InkBox, { flexDirection: "column", children: [_jsx(Header, { title: en.screen.update, version: version, update: update }), checking ? (_jsxs(Text, { color: theme.colors.textSecondary, children: [_jsx(Spinner, { type: "dots" }), " ", en.update.checking] })) : (_jsx(Text, { color: update.available ? theme.colors.warning : theme.colors.textSecondary, children: status })), _jsx(Text, { color: theme.colors.textMuted, children: en.update.manualHint }), _jsx(InkBox, { marginTop: 1, children: _jsx(Menu, { items: [
                        { label: en.update.checkNow, value: "check", disabled: checking },
                        { label: en.common.back, value: "back" }
                    ], onSelect: (value) => {
                        if (value === "check") {
                            onCheck();
                        }
                        else {
                            onBack();
                        }
                    } }) }), _jsx(StatusBar, {})] }));
}
//# sourceMappingURL=UpdateScreen.js.map