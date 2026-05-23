import { Box as InkBox, Text } from "ink";
import Spinner from "ink-spinner";
import { useEffect, useState } from "react";
import Header from "../components/Header.js";
import Logo from "../components/Logo.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import { getToolVersions } from "../lib/ytdlp.js";
import type { ToolVersions, UpdateCheckResult } from "../types/index.js";

interface AboutScreenProps {
  version: string;
  update: UpdateCheckResult;
  onBack: () => void;
}

export default function AboutScreen({ version, update, onBack }: AboutScreenProps): JSX.Element {
  const [tools, setTools] = useState<ToolVersions | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void getToolVersions()
      .then((versions) => {
        if (active) {
          setTools(versions);
        }
      })
      .catch((caughtError: unknown) => {
        if (active) {
          setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.about} version={version} update={update} />
      <Logo />
      <Text color={theme.colors.textPrimary}>{en.app.name}</Text>
      <Text color={theme.colors.textSecondary}>{en.app.version(version)}</Text>
      <Text color={theme.colors.textSecondary}>{en.app.github}</Text>
      <Text color={theme.colors.textSecondary}>{en.app.license}</Text>
      <Text color={theme.colors.primary}>{en.app.madeBy}</Text>
      {tools === null && error === null && (
        <Text color={theme.colors.textSecondary}>
          <Spinner type="dots" /> {en.about.loadingTools}
        </Text>
      )}
      {tools !== null && (
        <InkBox flexDirection="column" marginTop={1}>
          <Text color={theme.colors.textSecondary}>
            {en.about.ytdlpVersion}: {tools.ytdlp}
          </Text>
          <Text color={theme.colors.textSecondary}>
            {en.about.ffmpegVersion}: {tools.ffmpeg}
          </Text>
        </InkBox>
      )}
      {error !== null && <Text color={theme.colors.warning}>{error}</Text>}
      <InkBox marginTop={1}>
        <Menu items={[{ label: en.common.back, value: "back" }]} onSelect={onBack} />
      </InkBox>
      <StatusBar />
    </InkBox>
  );
}
