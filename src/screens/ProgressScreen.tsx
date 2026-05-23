import { Box as InkBox, Text } from "ink";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import ProgressBar from "../components/ProgressBar.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import type { DownloadProgress, DownloadStatus, MenuItem, UpdateCheckResult } from "../types/index.js";

interface ProgressScreenProps {
  version: string;
  update: UpdateCheckResult;
  status: DownloadStatus;
  progress: DownloadProgress;
  error: string | null;
  logLines: string[];
  completedFilePath: string | null;
  onOpenFolder: () => void;
  onDownloadAnother: () => void;
  onHome: () => void;
}

type ProgressAction = "open" | "another" | "home";

export default function ProgressScreen({
  version,
  update,
  status,
  progress,
  error,
  logLines,
  completedFilePath,
  onOpenFolder,
  onDownloadAnother,
  onHome
}: ProgressScreenProps): JSX.Element {
  const completed = status === "completed";
  const failed = status === "failed";
  const actionItems: Array<MenuItem<ProgressAction>> = [
    { label: en.common.openFolder, value: "open", disabled: completedFilePath === null },
    { label: en.common.downloadAnother, value: "another" },
    { label: en.common.backHome, value: "home" }
  ];

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.progress} version={version} update={update} />
      <Text color={completed ? theme.colors.success : failed ? theme.colors.error : theme.colors.textPrimary}>
        {completed ? en.progress.completed : failed ? en.progress.failed : en.progress.steps[progress.step]}
      </Text>
      <ProgressBar percent={progress.percent} />
      <Text color={theme.colors.textSecondary}>
        {progress.speed || en.common.unknown}  {en.progress.eta} {progress.eta || en.common.unknown}  {progress.downloaded || en.common.unknown} / {progress.total || en.common.unknown}
      </Text>
      {completedFilePath !== null && (
        <Text color={theme.colors.textSecondary}>
          {en.progress.filePath}: {completedFilePath}
        </Text>
      )}
      {error !== null && <Text color={theme.colors.error}>{error}</Text>}
      {logLines.map((line, index) => (
        <Text key={`${index}:${line}`} color={theme.colors.textMuted}>
          {line}
        </Text>
      ))}
      {(completed || failed) && (
        <InkBox marginTop={1}>
          <Menu
            items={actionItems}
            onSelect={(value) => {
              if (value === "open") {
                onOpenFolder();
              } else if (value === "another") {
                onDownloadAnother();
              } else {
                onHome();
              }
            }}
          />
        </InkBox>
      )}
      <StatusBar />
    </InkBox>
  );
}
