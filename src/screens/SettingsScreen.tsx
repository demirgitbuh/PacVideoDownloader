import { Box as InkBox, Text } from "ink";
import TextInput from "ink-text-input";
import { useState } from "react";
import Header from "../components/Header.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import type { AppConfig, MediaFormat, MenuItem, Quality, UpdateCheckResult } from "../types/index.js";

interface SettingsScreenProps {
  version: string;
  update: UpdateCheckResult;
  config: AppConfig;
  error: string | null;
  onUpdate: (patch: Partial<AppConfig>) => Promise<void>;
  onReset: () => Promise<void>;
  onBack: () => void;
}

type EditableKey = "downloadDir" | "filenameTemplate" | "concurrentDownloads" | "subtitleLanguage";
type SettingsValue = EditableKey | "format" | "quality" | "updates" | "reset" | "back";

const formats: MediaFormat[] = ["mp4", "mp3", "webm", "mkv", "m4a"];
const qualities: Quality[] = ["2160p", "1440p", "1080p", "720p", "480p", "360p", "best", "worst"];

const nextValue = <TValue extends string>(values: TValue[], current: TValue): TValue => values[(values.indexOf(current) + 1) % values.length] ?? values[0] ?? current;

export default function SettingsScreen({ version, update, config, error, onUpdate, onReset, onBack }: SettingsScreenProps): JSX.Element {
  const [editing, setEditing] = useState<EditableKey | null>(null);
  const [draft, setDraft] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const startEdit = (key: EditableKey, value: string): void => {
    setEditing(key);
    setDraft(value);
    setLocalError(null);
  };

  const submitEdit = (value: string): void => {
    const trimmed = value.trim();

    if (editing === "downloadDir" && trimmed.length === 0) {
      setLocalError(en.validation.pathRequired);
      return;
    }

    if (editing === "subtitleLanguage" && trimmed.length === 0) {
      setLocalError(en.validation.languageRequired);
      return;
    }

    if (editing === "concurrentDownloads") {
      const concurrentDownloads = Number.parseInt(trimmed, 10);
      if (!Number.isFinite(concurrentDownloads) || concurrentDownloads < 1 || concurrentDownloads > 5) {
        setLocalError(en.validation.concurrentRange);
        return;
      }

      void onUpdate({ concurrentDownloads });
      setEditing(null);
      return;
    }

    if (editing !== null) {
      void onUpdate({ [editing]: trimmed });
      setEditing(null);
    }
  };

  const items: Array<MenuItem<SettingsValue>> = [
    { label: `${en.settings.labels.downloadDir}: ${config.downloadDir}`, value: "downloadDir" },
    { label: `${en.settings.labels.defaultFormat}: ${en.format.labels[config.defaultFormat]}`, value: "format" },
    { label: `${en.settings.labels.defaultQuality}: ${en.quality.labels[config.defaultQuality]}`, value: "quality" },
    { label: `${en.settings.labels.filenameTemplate}: ${config.filenameTemplate}`, value: "filenameTemplate" },
    { label: `${en.settings.labels.concurrentDownloads}: ${config.concurrentDownloads.toString()}`, value: "concurrentDownloads" },
    { label: `${en.settings.labels.subtitleLanguage}: ${config.subtitleLanguage}`, value: "subtitleLanguage" },
    { label: `${en.settings.labels.checkUpdatesOnStartup}: ${config.checkUpdatesOnStartup ? en.common.enabled : en.common.disabled}`, value: "updates" },
    { label: en.settings.reset, value: "reset" },
    { label: en.common.back, value: "back" }
  ];

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.settings} version={version} update={update} />
      {editing === null ? (
        <Menu
          items={items}
          onSelect={(value) => {
            if (value === "downloadDir") {
              startEdit(value, config.downloadDir);
            } else if (value === "filenameTemplate") {
              startEdit(value, config.filenameTemplate);
            } else if (value === "concurrentDownloads") {
              startEdit(value, config.concurrentDownloads.toString());
            } else if (value === "subtitleLanguage") {
              startEdit(value, config.subtitleLanguage);
            } else if (value === "format") {
              void onUpdate({ defaultFormat: nextValue(formats, config.defaultFormat) });
            } else if (value === "quality") {
              void onUpdate({ defaultQuality: nextValue(qualities, config.defaultQuality) });
            } else if (value === "updates") {
              void onUpdate({ checkUpdatesOnStartup: !config.checkUpdatesOnStartup });
            } else if (value === "reset") {
              void onReset();
            } else {
              onBack();
            }
          }}
        />
      ) : (
        <InkBox flexDirection="column">
          <Text color={theme.colors.textPrimary}>
            {en.settings.edit}: {en.settings.labels[editing]}
          </Text>
          <InkBox>
            <Text color={theme.colors.primary}>{en.symbols.pointer} </Text>
            <TextInput value={draft} onChange={setDraft} onSubmit={submitEdit} focus={process.stdin.isTTY === true} />
          </InkBox>
        </InkBox>
      )}
      {localError !== null && <Text color={theme.colors.error}>{localError}</Text>}
      {error !== null && <Text color={theme.colors.error}>{error}</Text>}
      <StatusBar message={editing === null ? en.common.keyHint : en.common.inputHint} />
    </InkBox>
  );
}
