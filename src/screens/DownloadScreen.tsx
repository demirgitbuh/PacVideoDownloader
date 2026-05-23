import { Box as InkBox, Text } from "ink";
import Spinner from "ink-spinner";
import TextInput from "ink-text-input";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import type { DownloadStatus, UpdateCheckResult } from "../types/index.js";

interface DownloadScreenProps {
  version: string;
  update: UpdateCheckResult;
  url: string;
  status: DownloadStatus;
  error: string | null;
  onUrlChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onBack: () => void;
}

export default function DownloadScreen({ version, update, url, status, error, onUrlChange, onSubmit, onBack }: DownloadScreenProps): JSX.Element {
  const loading = status === "loading";

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.download} version={version} update={update} />
      <Text color={theme.colors.textPrimary}>{en.download.title}</Text>
      <InkBox>
        <Text color={theme.colors.primary}>{en.symbols.pointer} </Text>
        <TextInput value={url} onChange={onUrlChange} onSubmit={onSubmit} focus={!loading && process.stdin.isTTY === true} />
      </InkBox>
      <Text color={theme.colors.textMuted}>{en.common.pasteHint}</Text>
      {loading && (
        <Text color={theme.colors.textSecondary}>
          <Spinner type="dots" /> {en.download.loadingMetadata}
        </Text>
      )}
      {error !== null && <Text color={theme.colors.error}>{error}</Text>}
      <InkBox marginTop={1}>
        <Menu items={[{ label: en.common.back, value: "back" }]} onSelect={onBack} isActive={!loading} />
      </InkBox>
      <StatusBar message={en.common.inputHint} />
    </InkBox>
  );
}
