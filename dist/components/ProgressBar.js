import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text } from "ink";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function ProgressBar({ percent, width = 28 }) {
    const normalized = Math.max(0, Math.min(100, percent));
    const filledCount = Math.round((normalized / 100) * width);
    const emptyCount = width - filledCount;
    const filled = en.symbols.filled.repeat(filledCount);
    const empty = en.symbols.empty.repeat(emptyCount);
    return (_jsxs(Text, { children: [_jsx(Text, { color: theme.colors.primary, children: filled }), _jsx(Text, { color: theme.colors.textMuted, children: empty }), _jsxs(Text, { color: theme.colors.textSecondary, children: [" ", normalized.toFixed(1), "%"] })] }));
}
//# sourceMappingURL=ProgressBar.js.map