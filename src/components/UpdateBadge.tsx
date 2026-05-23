import { Text } from "ink";
import type { UpdateCheckResult } from "../types/index.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";

interface UpdateBadgeProps {
  update: UpdateCheckResult;
}

export default function UpdateBadge({ update }: UpdateBadgeProps): JSX.Element | null {
  if (!update.available || update.latestVersion === undefined) {
    return null;
  }

  return <Text color={theme.colors.warning}>{en.update.badge(update.latestVersion)}</Text>;
}
