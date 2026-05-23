import { Box as InkBox, Text } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import VideoInfoCard from "../components/VideoInfoCard.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import type { MediaFormat, MenuItem, UpdateCheckResult, VideoMetadata } from "../types/index.js";

interface FormatScreenProps {
  version: string;
  update: UpdateCheckResult;
  metadata: VideoMetadata;
  availableFormats: MediaFormat[];
  onSelect: (format: MediaFormat) => void;
  onBack: () => void;
}

type FormatMenuValue = MediaFormat | "back";

export default function FormatScreen({ version, update, metadata, availableFormats, onSelect, onBack }: FormatScreenProps): JSX.Element {
  const values: MediaFormat[] = ["mp4", "mp3", "webm", "mkv", "m4a"];
  const items: Array<MenuItem<FormatMenuValue>> = [
    ...values.map((format) => ({
      label: en.format.labels[format],
      value: format,
      disabled: !availableFormats.includes(format),
      detail: availableFormats.includes(format) ? undefined : en.common.unavailable
    })),
    { label: en.common.back, value: "back" }
  ];

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.format} version={version} update={update} />
      <VideoInfoCard metadata={metadata} />
      <InkBox marginTop={1} flexDirection="column">
        <Text color={theme.colors.textPrimary}>{en.format.prompt}</Text>
        <Menu
          items={items}
          onSelect={(value) => {
            if (value === "back") {
              onBack();
            } else {
              onSelect(value);
            }
          }}
        />
      </InkBox>
      <StatusBar />
    </InkBox>
  );
}
