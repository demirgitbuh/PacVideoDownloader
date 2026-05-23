import { Text } from "ink";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";

interface ProgressBarProps {
  percent: number;
  width?: number;
}

export default function ProgressBar({ percent, width = 28 }: ProgressBarProps): JSX.Element {
  const normalized = Math.max(0, Math.min(100, percent));
  const filledCount = Math.round((normalized / 100) * width);
  const emptyCount = width - filledCount;
  const filled = en.symbols.filled.repeat(filledCount);
  const empty = en.symbols.empty.repeat(emptyCount);

  return (
    <Text>
      <Text color={theme.colors.primary}>{filled}</Text>
      <Text color={theme.colors.textMuted}>{empty}</Text>
      <Text color={theme.colors.textSecondary}> {normalized.toFixed(1)}%</Text>
    </Text>
  );
}
