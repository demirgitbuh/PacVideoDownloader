import { Box as InkBox, Text } from "ink";
import Spinner from "ink-spinner";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import type { UpdateCheckResult } from "../types/index.js";

interface UpdateScreenProps {
  version: string;
  update: UpdateCheckResult;
  checking: boolean;
  onCheck: () => void;
  onBack: () => void;
}

export default function UpdateScreen({ version, update, checking, onCheck, onBack }: UpdateScreenProps): JSX.Element {
  const status =
    update.error !== undefined
      ? `${en.update.failed}: ${update.error}`
      : update.available && update.latestVersion !== undefined
        ? en.update.available(update.latestVersion)
        : update.checked
          ? en.update.upToDate
          : en.update.manualHint;

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.update} version={version} update={update} />
      {checking ? (
        <Text color={theme.colors.textSecondary}>
          <Spinner type="dots" /> {en.update.checking}
        </Text>
      ) : (
        <Text color={update.available ? theme.colors.warning : theme.colors.textSecondary}>{status}</Text>
      )}
      <Text color={theme.colors.textMuted}>{en.update.manualHint}</Text>
      <InkBox marginTop={1}>
        <Menu
          items={[
            { label: en.update.checkNow, value: "check", disabled: checking },
            { label: en.common.back, value: "back" }
          ]}
          onSelect={(value) => {
            if (value === "check") {
              onCheck();
            } else {
              onBack();
            }
          }}
        />
      </InkBox>
      <StatusBar />
    </InkBox>
  );
}
