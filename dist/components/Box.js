import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text } from "ink";
import { theme } from "../lib/theme.js";
export default function Box({ title, children }) {
    return (_jsxs(InkBox, { borderStyle: "round", borderColor: theme.colors.borderSubtle, flexDirection: "column", paddingX: 1, paddingY: 0, children: [title !== undefined && _jsx(Text, { color: theme.colors.primary, children: title }), children] }));
}
//# sourceMappingURL=Box.js.map