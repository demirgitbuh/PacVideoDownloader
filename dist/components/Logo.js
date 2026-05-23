import { jsx as _jsx } from "react/jsx-runtime";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
export default function Logo() {
    return (_jsx(Gradient, { colors: [theme.colors.primary, theme.colors.primaryBright], children: _jsx(BigText, { text: en.app.logo }) }));
}
//# sourceMappingURL=Logo.js.map