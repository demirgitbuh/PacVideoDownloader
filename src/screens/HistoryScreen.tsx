import { Box as InkBox, Text } from "ink";
import TextInput from "ink-text-input";
import { useMemo, useState } from "react";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import type { HistoryEntry, MenuItem, UpdateCheckResult } from "../types/index.js";

interface HistoryScreenProps {
  version: string;
  update: UpdateCheckResult;
  entries: HistoryEntry[];
  error: string | null;
  onRedownload: (url: string) => void;
  onOpenLocation: (filePath: string) => void;
  onCopyUrl: (url: string) => void;
  onDelete: (date: string) => void;
  onBack: () => void;
}

type HistoryMenuValue = "sort" | "back" | string;
type ActionValue = "redownload" | "open" | "copy" | "delete" | "back";

export default function HistoryScreen({
  version,
  update,
  entries,
  error,
  onRedownload,
  onOpenLocation,
  onCopyUrl,
  onDelete,
  onBack
}: HistoryScreenProps): JSX.Element {
  const [filter, setFilter] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const activeEntry = entries.find((entry) => entry.date === activeDate) ?? null;

  const filteredEntries = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    const visible = normalized.length === 0 ? entries : entries.filter((entry) => entry.title.toLowerCase().includes(normalized) || entry.url.toLowerCase().includes(normalized));
    return [...visible].sort((left, right) => (newestFirst ? right.date.localeCompare(left.date) : left.date.localeCompare(right.date)));
  }, [entries, filter, newestFirst]);

  const items: Array<MenuItem<HistoryMenuValue>> = [
    { label: newestFirst ? en.history.newest : en.history.oldest, value: "sort" },
    ...filteredEntries.map((entry) => ({
      label: entry.title,
      value: entry.date,
      detail: `${entry.format} ${entry.quality} ${entry.status}`
    })),
    { label: en.common.back, value: "back" }
  ];

  const actionItems: Array<MenuItem<ActionValue>> = [
    { label: en.history.reDownload, value: "redownload" },
    { label: en.history.openLocation, value: "open" },
    { label: en.history.copyUrl, value: "copy" },
    { label: en.history.delete, value: "delete" },
    { label: en.common.back, value: "back" }
  ];

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.history} version={version} update={update} />
      <Text color={theme.colors.textPrimary}>{en.history.filter}</Text>
      <InkBox>
        <Text color={theme.colors.primary}>{en.symbols.pointer} </Text>
        <TextInput value={filter} onChange={setFilter} focus={activeEntry === null && process.stdin.isTTY === true} />
      </InkBox>
      {error !== null && <Text color={theme.colors.error}>{error}</Text>}
      {filteredEntries.length === 0 && <Text color={theme.colors.textMuted}>{en.history.noMatches}</Text>}
      {activeEntry === null ? (
        <Menu
          items={items}
          onSelect={(value) => {
            if (value === "sort") {
              setNewestFirst((current) => !current);
            } else if (value === "back") {
              onBack();
            } else {
              setActiveDate(value);
            }
          }}
        />
      ) : (
        <InkBox flexDirection="column" marginTop={1}>
          <Text color={theme.colors.textPrimary}>{activeEntry.title}</Text>
          <Text color={theme.colors.textSecondary}>{activeEntry.url}</Text>
          <Text color={theme.colors.textSecondary}>
            {en.history.status}: {activeEntry.status}
          </Text>
          <Menu
            items={actionItems}
            onSelect={(value) => {
              if (value === "redownload") {
                onRedownload(activeEntry.url);
              } else if (value === "open") {
                onOpenLocation(activeEntry.filePath);
              } else if (value === "copy") {
                onCopyUrl(activeEntry.url);
              } else if (value === "delete") {
                onDelete(activeEntry.date);
                setActiveDate(null);
              } else {
                setActiveDate(null);
              }
            }}
          />
        </InkBox>
      )}
      <StatusBar />
    </InkBox>
  );
}
