import { Box as InkBox, Text, useInput } from "ink";
import { useEffect, useMemo, useState } from "react";
import type { MenuItem } from "../types/index.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";

interface MenuProps<TValue extends string> {
  items: Array<MenuItem<TValue>>;
  onSelect: (value: TValue) => void;
  isActive?: boolean;
}

const firstEnabledIndex = <TValue extends string>(items: Array<MenuItem<TValue>>): number => {
  const index = items.findIndex((item) => item.disabled !== true);
  return index >= 0 ? index : 0;
};

const nextEnabledIndex = <TValue extends string>(items: Array<MenuItem<TValue>>, current: number, direction: 1 | -1): number => {
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

export default function Menu<TValue extends string>({ items, onSelect, isActive = true }: MenuProps<TValue>): JSX.Element {
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

  useInput(
    (_input, key) => {
      if (key.downArrow) {
        setSelectedIndex((current) => nextEnabledIndex(items, current, 1));
      }

      if (key.upArrow) {
        setSelectedIndex((current) => nextEnabledIndex(items, current, -1));
      }

      if (key.return && selectedItem !== undefined && selectedItem.disabled !== true) {
        onSelect(selectedItem.value);
      }
    },
    { isActive: isActive && process.stdin.isTTY === true }
  );

  return (
    <InkBox flexDirection="column">
      {items.map((item, index) => {
        const selected = index === selectedIndex;
        const disabled = item.disabled === true;
        const color = disabled ? theme.colors.textMuted : selected ? theme.colors.primary : theme.colors.textPrimary;

        return (
          <InkBox key={item.value} gap={1}>
            <Text color={color}>{selected ? en.symbols.pointer : " "}</Text>
            <Text color={color}>{disabled ? en.symbols.empty : en.symbols.filled}</Text>
            <Text color={color}>{item.label}</Text>
            {item.detail !== undefined && <Text color={theme.colors.textMuted}>{item.detail}</Text>}
          </InkBox>
        );
      })}
    </InkBox>
  );
}
