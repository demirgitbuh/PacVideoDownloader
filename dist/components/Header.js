import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import UpdateBadge from "./UpdateBadge.js";
export default function Header({ title, version, update }) {
    return (_jsxs(InkBox, { flexDirection: "column", marginBottom: 1, children: [_jsxs(InkBox, { gap: 1, children: [_jsx(Text, { bold: true, color: theme.colors.primary, children: en.app.name }), _jsx(Text, { color: theme.colors.textMuted, children: en.app.version(version) }), _jsx(UpdateBadge, { update: update })] }), _jsx(Text, { color: theme.colors.textSecondary, children: title })] }));
}
//# sourceMappingURL=Header.js.map