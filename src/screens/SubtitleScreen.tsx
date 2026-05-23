import { Box as InkBox, Text } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import VideoInfoCard from "../components/VideoInfoCard.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import type { MenuItem, SubtitleMode, UpdateCheckResult, VideoMetadata } from "../types/index.js";

interface SubtitleScreenProps {
  version: string;
  update: UpdateCheckResult;
  metadata: VideoMetadata;
  onSelect: (mode: SubtitleMode) => void;
  onBack: () => void;
}

type SubtitleMenuValue = SubtitleMode | "back";

export default function SubtitleScreen({ version, update, metadata, onSelect, onBack }: SubtitleScreenProps): JSX.Element {
  const values: SubtitleMode[] = ["none", "auto", "manual", "all"];
  const items: Array<MenuItem<SubtitleMenuValue>> = [
    ...values.map((mode) => ({ label: en.subtitle.labels[mode], value: mode })),
    { label: en.common.back, value: "back" }
  ];

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.subtitle} version={version} update={update} />
      <VideoInfoCard metadata={metadata} />
      <InkBox marginTop={1} flexDirection="column">
        <Text color={theme.colors.textPrimary}>{en.subtitle.prompt}</Text>
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
