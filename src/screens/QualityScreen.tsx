import { Box as InkBox, Text } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import VideoInfoCard from "../components/VideoInfoCard.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import type { MenuItem, Quality, UpdateCheckResult, VideoMetadata } from "../types/index.js";

interface QualityScreenProps {
  version: string;
  update: UpdateCheckResult;
  metadata: VideoMetadata;
  availableQualities: Array<{ quality: Quality; available: boolean }>;
  onSelect: (quality: Quality) => void;
  onBack: () => void;
}

type QualityMenuValue = Quality | "back";

export default function QualityScreen({ version, update, metadata, availableQualities, onSelect, onBack }: QualityScreenProps): JSX.Element {
  const items: Array<MenuItem<QualityMenuValue>> = [
    ...availableQualities.map(({ quality, available }) => ({
      label: en.quality.labels[quality],
      value: quality,
      disabled: !available,
      detail: available ? undefined : en.common.unavailable
    })),
    { label: en.common.back, value: "back" }
  ];

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.quality} version={version} update={update} />
      <VideoInfoCard metadata={metadata} />
      <InkBox marginTop={1} flexDirection="column">
        <Text color={theme.colors.textPrimary}>{en.quality.prompt}</Text>
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
