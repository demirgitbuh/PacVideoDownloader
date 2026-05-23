import { Box as InkBox, Text } from "ink";
import Spinner from "ink-spinner";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import VideoInfoCard from "../components/VideoInfoCard.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import type { AppConfig, MediaFormat, Quality, SubtitleMode, UpdateCheckResult, VideoMetadata } from "../types/index.js";

interface ConfirmScreenProps {
  version: string;
  update: UpdateCheckResult;
  config: AppConfig;
  metadata: VideoMetadata;
  format: MediaFormat;
  quality: Quality;
  subtitleMode: SubtitleMode;
  filenamePreview: string | null;
  loading: boolean;
  error: string | null;
  onStart: () => void;
  onBack: () => void;
}

export default function ConfirmScreen({
  version,
  update,
  config,
  metadata,
  format,
  quality,
  subtitleMode,
  filenamePreview,
  loading,
  error,
  onStart,
  onBack
}: ConfirmScreenProps): JSX.Element {
  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.confirm} version={version} update={update} />
      <VideoInfoCard metadata={metadata} />
      <InkBox flexDirection="column" marginTop={1}>
        <Text color={theme.colors.textPrimary}>{en.confirm.prompt}</Text>
        <Text color={theme.colors.textSecondary}>
          {en.confirm.optionFormat}: {en.format.labels[format]}
        </Text>
        <Text color={theme.colors.textSecondary}>
          {en.confirm.optionQuality}: {en.quality.labels[quality]}
        </Text>
        <Text color={theme.colors.textSecondary}>
          {en.confirm.optionSubtitles}: {en.subtitle.labels[subtitleMode]}
        </Text>
        <Text color={theme.colors.textSecondary}>
          {en.confirm.optionDirectory}: {config.downloadDir}
        </Text>
        <Text color={theme.colors.textSecondary}>
          {en.confirm.filenamePreview}: {filenamePreview ?? en.common.unknown}
        </Text>
      </InkBox>
      {loading && (
        <Text color={theme.colors.textSecondary}>
          <Spinner type="dots" /> {en.confirm.recalculating}
        </Text>
      )}
      {error !== null && <Text color={theme.colors.error}>{error}</Text>}
      <InkBox marginTop={1}>
        <Menu
          items={[
            { label: en.confirm.start, value: "start", disabled: loading },
            { label: en.common.back, value: "back" }
          ]}
          onSelect={(value) => {
            if (value === "start") {
              onStart();
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
