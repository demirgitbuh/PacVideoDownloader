import { Text } from "ink";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";

interface StatusBarProps {
  message?: string;
}

export default function StatusBar({ message = en.common.keyHint }: StatusBarProps): JSX.Element {
  return <Text color={theme.colors.textMuted}>{message}</Text>;
}
