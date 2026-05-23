import { Box as InkBox, Text } from "ink";
import type { UpdateCheckResult } from "../types/index.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import UpdateBadge from "./UpdateBadge.js";

interface HeaderProps {
  title: string;
  version: string;
  update: UpdateCheckResult;
}

export default function Header({ title, version, update }: HeaderProps): JSX.Element {
  return (
    <InkBox flexDirection="column" marginBottom={1}>
      <InkBox gap={1}>
        <Text bold color={theme.colors.primary}>
          {en.app.name}
        </Text>
        <Text color={theme.colors.textMuted}>{en.app.version(version)}</Text>
        <UpdateBadge update={update} />
      </InkBox>
      <Text color={theme.colors.textSecondary}>{title}</Text>
    </InkBox>
  );
}
