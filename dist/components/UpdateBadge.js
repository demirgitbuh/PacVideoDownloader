import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from "ink";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function UpdateBadge({ update }) {
    if (!update.available || update.latestVersion === undefined) {
        return null;
    }
    return _jsx(Text, { color: theme.colors.warning, children: en.update.badge(update.latestVersion) });
}
//# sourceMappingURL=UpdateBadge.js.map