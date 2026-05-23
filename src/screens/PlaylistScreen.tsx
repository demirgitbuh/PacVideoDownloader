import { Box as InkBox, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import { useMemo, useState } from "react";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import { formatDuration } from "../lib/ytdlp.js";
import type { MenuItem, PlaylistItem, PlaylistMetadata, UpdateCheckResult } from "../types/index.js";

interface PlaylistScreenProps {
  version: string;
  update: UpdateCheckResult;
  playlist: PlaylistMetadata;
  loading: boolean;
  error: string | null;
  onContinue: (items: PlaylistItem[]) => void;
  onBack: () => void;
}

type PlaylistMode = "menu" | "range" | "individual";
type PlaylistMenuValue = "all" | "range" | "individual" | "back";

const parseRange = (range: string, items: PlaylistItem[]): PlaylistItem[] => {
  const [startRaw, endRaw] = range.split("-");
  const start = Math.max(1, Number.parseInt(startRaw ?? "", 10));
  const end = Math.min(items.length, Number.parseInt(endRaw ?? startRaw ?? "", 10));

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
    return [];
  }

  return items.filter((item) => item.index >= start && item.index <= end);
};

export default function PlaylistScreen({ version, update, playlist, loading, error, onContinue, onBack }: PlaylistScreenProps): JSX.Element {
  const [mode, setMode] = useState<PlaylistMode>("menu");
  const [range, setRange] = useState("1-10");
  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(playlist.items.map((item) => item.index)));
  const selectedItems = useMemo(() => playlist.items.filter((item) => selected.has(item.index)).map((item) => ({ ...item, selected: true })), [playlist.items, selected]);
  const visibleItems = playlist.items.slice(Math.max(0, cursor - 4), Math.max(0, cursor - 4) + 8);

  useInput(
    (input, key) => {
      if (mode !== "individual" || loading) {
        return;
      }

      if (key.downArrow) {
        setCursor((current) => Math.min(playlist.items.length - 1, current + 1));
      }

      if (key.upArrow) {
        setCursor((current) => Math.max(0, current - 1));
      }

      if (input === " ") {
        const item = playlist.items[cursor];
        if (item !== undefined) {
          setSelected((current) => {
            const next = new Set(current);
            if (next.has(item.index)) {
              next.delete(item.index);
            } else {
              next.add(item.index);
            }
            return next;
          });
        }
      }

      if (key.return) {
        onContinue(selectedItems);
      }

      if (key.escape) {
        setMode("menu");
      }
    },
    { isActive: mode === "individual" && !loading && process.stdin.isTTY === true }
  );

  const menuItems: Array<MenuItem<PlaylistMenuValue>> = [
    { label: en.playlist.all, value: "all" },
    { label: en.playlist.range, value: "range" },
    { label: en.playlist.individual, value: "individual" },
    { label: en.common.back, value: "back" }
  ];

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.playlist} version={version} update={update} />
      <Text color={theme.colors.textPrimary}>{playlist.title}</Text>
      <Text color={theme.colors.textSecondary}>{en.video.playlistCount(playlist.itemCount)}</Text>
      <Text color={theme.colors.textSecondary}>{en.video.totalDuration(formatDuration(playlist.totalDurationSeconds))}</Text>
      {error !== null && <Text color={theme.colors.error}>{error}</Text>}
      {mode === "menu" && (
        <Menu
          items={menuItems}
          isActive={!loading}
          onSelect={(value) => {
            if (value === "all") {
              onContinue(playlist.items.map((item) => ({ ...item, selected: true })));
            } else if (value === "range") {
              setMode("range");
            } else if (value === "individual") {
              setMode("individual");
            } else {
              onBack();
            }
          }}
        />
      )}
      {mode === "range" && (
        <InkBox flexDirection="column" marginTop={1}>
          <Text color={theme.colors.textPrimary}>{en.playlist.rangeInput}</Text>
          <InkBox>
            <Text color={theme.colors.primary}>{en.symbols.pointer} </Text>
            <TextInput
              value={range}
              onChange={setRange}
              onSubmit={(value) => {
                onContinue(parseRange(value, playlist.items));
              }}
              focus={!loading && process.stdin.isTTY === true}
            />
          </InkBox>
          <Menu items={[{ label: en.common.back, value: "back" }]} onSelect={() => setMode("menu")} isActive={!loading} />
        </InkBox>
      )}
      {mode === "individual" && (
        <InkBox flexDirection="column" marginTop={1}>
          <Text color={theme.colors.textSecondary}>{en.playlist.selectedCount(selectedItems.length)}</Text>
          {visibleItems.map((item) => {
            const active = playlist.items[cursor]?.index === item.index;
            return (
              <InkBox key={item.index} gap={1}>
                <Text color={active ? theme.colors.primary : theme.colors.textMuted}>{active ? en.symbols.pointer : " "}</Text>
                <Text color={selected.has(item.index) ? theme.colors.success : theme.colors.textMuted}>{selected.has(item.index) ? en.symbols.success : en.symbols.empty}</Text>
                <Text color={theme.colors.textPrimary}>{item.index.toString()}</Text>
                <Text color={theme.colors.textSecondary}>{item.title}</Text>
              </InkBox>
            );
          })}
          <Text color={theme.colors.textMuted}>{en.playlist.toggleHint}</Text>
        </InkBox>
      )}
      <StatusBar />
    </InkBox>
  );
}
