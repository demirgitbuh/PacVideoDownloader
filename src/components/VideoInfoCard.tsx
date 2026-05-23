import { Box as InkBox, Text } from "ink";
import type { VideoMetadata } from "../types/index.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import { formatDuration, formatViewCount } from "../lib/ytdlp.js";
import Box from "./Box.js";

interface VideoInfoCardProps {
  metadata: VideoMetadata;
}

export default function VideoInfoCard({ metadata }: VideoInfoCardProps): JSX.Element {
  const rows: Array<[string, string]> = [
    [en.video.title, metadata.title],
    [en.video.channel, metadata.channel ?? en.common.unknown],
    [en.video.duration, formatDuration(metadata.durationSeconds)],
    [en.video.views, formatViewCount(metadata.viewCount)],
    [en.video.thumbnail, metadata.thumbnail ?? en.common.unknown],
    [en.video.uploadDate, metadata.uploadDate ?? en.common.unknown],
    [en.video.formats, metadata.formats.length.toString()]
  ];

  return (
    <Box title={en.app.name}>
      {rows.map(([label, value]) => (
        <InkBox key={label}>
          <Text color={theme.colors.textSecondary}>{label}: </Text>
          <Text color={theme.colors.textPrimary}>{value}</Text>
        </InkBox>
      ))}
    </Box>
  );
}
