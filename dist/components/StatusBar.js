import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from "ink";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function StatusBar({ message = en.common.keyHint }) {
    return _jsx(Text, { color: theme.colors.textMuted, children: message });
}
//# sourceMappingURL=StatusBar.js.map