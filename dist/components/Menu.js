import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box as InkBox, Text, useInput } from "ink";
import { useEffect, useMemo, useState } from "react";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
const firstEnabledIndex = (items) => {
    const index = items.findIndex((item) => item.disabled !== true);
    return index >= 0 ? index : 0;
};
const nextEnabledIndex = (items, current, direction) => {
    if (items.length === 0) {
        return 0;
    }
    for (let offset = 1; offset <= items.length; offset += 1) {
        const next = (current + offset * direction + items.length) % items.length;
        if (items[next]?.disabled !== true) {
            return next;
        }
    }
    return current;
};
export default function Menu({ items, onSelect, isActive = true }) {
    const [selectedIndex, setSelectedIndex] = useState(() => firstEnabledIndex(items));
    const selectedItem = items[selectedIndex];
    const enabledSignature = useMemo(() => items.map((item) => `${item.value}:${item.disabled === true ? "0" : "1"}`).join("|"), [items]);
    useEffect(() => {
        setSelectedIndex((current) => {
            if (items[current]?.disabled !== true && current < items.length) {
                return current;
            }
            return firstEnabledIndex(items);
        });
    }, [enabledSignature, items]);
    useInput((_input, key) => {
        if (key.downArrow) {
            setSelectedIndex((current) => nextEnabledIndex(items, current, 1));
        }
        if (key.upArrow) {
            setSelectedIndex((current) => nextEnabledIndex(items, current, -1));
        }
        if (key.return && selectedItem !== undefined && selectedItem.disabled !== true) {
            onSelect(selectedItem.value);
        }
    }, { isActive: isActive && process.stdin.isTTY === true });
    return (_jsx(InkBox, { flexDirection: "column", children: items.map((item, index) => {
            const selected = index === selectedIndex;
            const disabled = item.disabled === true;
            const color = disabled ? theme.colors.textMuted : selected ? theme.colors.primary : theme.colors.textPrimary;
            return (_jsxs(InkBox, { gap: 1, children: [_jsx(Text, { color: color, children: selected ? en.symbols.pointer : " " }), _jsx(Text, { color: color, children: disabled ? en.symbols.empty : en.symbols.filled }), _jsx(Text, { color: color, children: item.label }), item.detail !== undefined && _jsx(Text, { color: theme.colors.textMuted, children: item.detail })] }, item.value));
        }) }));
}
//# sourceMappingURL=Menu.js.map