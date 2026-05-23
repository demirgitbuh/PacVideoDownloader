import { Box as InkBox, Text, useApp, useInput } from "ink";
import { useEffect, useState } from "react";
import Header from "./components/Header.js";
import Menu from "./components/Menu.js";
import StatusBar from "./components/StatusBar.js";
import useConfig from "./hooks/useConfig.js";
import useDownload from "./hooks/useDownload.js";
import useHistory from "./hooks/useHistory.js";
import useNavigation from "./hooks/useNavigation.js";
import useUpdate from "./hooks/useUpdate.js";
import { en } from "./locales/en.js";
import { theme } from "./lib/theme.js";
import { copyToClipboard, isAudioFormat, openContainingFolder } from "./lib/ytdlp.js";
import AboutScreen from "./screens/AboutScreen.js";
import ConfirmScreen from "./screens/ConfirmScreen.js";
import DownloadScreen from "./screens/DownloadScreen.js";
import FormatScreen from "./screens/FormatScreen.js";
import HistoryScreen from "./screens/HistoryScreen.js";
import HomeScreen from "./screens/HomeScreen.js";
import PlaylistScreen from "./screens/PlaylistScreen.js";
import ProgressScreen from "./screens/ProgressScreen.js";
import QualityScreen from "./screens/QualityScreen.js";
import SettingsScreen from "./screens/SettingsScreen.js";
import SubtitleScreen from "./screens/SubtitleScreen.js";
import UpdateScreen from "./screens/UpdateScreen.js";
import type { MediaFormat, PlaylistItem, Quality, ScreenName, SubtitleMode } from "./types/index.js";

interface AppProps {
  version: string;
  initialUrl?: string;
}

const messageFromError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export default function App({ version, initialUrl }: AppProps): JSX.Element {
  const { exit } = useApp();
  const configState = useConfig();
  const historyState = useHistory();
  const download = useDownload();
  const navigation = useNavigation(initialUrl === undefined ? "home" : "download");
  const updateState = useUpdate(configState.config, version);
  const [initialConsumed, setInitialConsumed] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);

  useInput(
    (input) => {
      if (input === "q") {
        exit();
      }
    },
    { isActive: process.stdin.isTTY === true }
  );

  const navigate = (screen: ScreenName): void => {
    setAppError(null);
    navigation.go(screen);
  };

  const loadUrlAndRoute = async (nextUrl: string): Promise<void> => {
    const probe = await download.loadUrl(nextUrl);

    if (probe === null) {
      return;
    }

    if (probe.kind === "playlist") {
      navigation.go("playlist");
    } else {
      navigation.go("format");
    }
  };

  useEffect(() => {
    if (initialUrl === undefined || initialConsumed || configState.config === null) {
      return;
    }

    setInitialConsumed(true);
    void loadUrlAndRoute(initialUrl);
  }, [configState.config, initialConsumed, initialUrl]);

  useEffect(() => {
    if (navigation.screen !== "confirm" || configState.config === null || download.filenamePreview !== null || download.status === "loading") {
      return;
    }

    void download.loadPreview(configState.config);
  }, [configState.config, download, navigation.screen]);

  const continuePlaylist = (items: PlaylistItem[]): void => {
    void download.preparePlaylistItems(items).then((ok) => {
      if (ok) {
        navigation.go("format");
      }
    });
  };

  const chooseFormat = (format: MediaFormat): void => {
    download.setFormat(format);
    navigation.go("quality");
  };

  const chooseQuality = (quality: Quality): void => {
    download.setQuality(quality);

    if (download.selectedFormat !== null && isAudioFormat(download.selectedFormat)) {
      download.setSubtitleMode("none");
      navigation.go("confirm");
      return;
    }

    navigation.go("subtitle");
  };

  const chooseSubtitle = (mode: SubtitleMode): void => {
    download.setSubtitleMode(mode);
    navigation.go("confirm");
  };

  const startDownload = (): void => {
    if (configState.config === null) {
      setAppError(en.common.error);
      return;
    }

    navigation.go("progress");
    void download.startDownload(configState.config, historyState.addEntry);
  };

  const openCompletedFolder = (): void => {
    if (download.completedFilePath === null) {
      return;
    }

    void openContainingFolder(download.completedFilePath).catch((error: unknown) => {
      setAppError(messageFromError(error));
    });
  };

  const downloadAnother = (): void => {
    download.resetFlow();
    navigation.go("download");
  };

  const redownload = (url: string): void => {
    download.resetFlow();
    navigation.go("download");
    void loadUrlAndRoute(url);
  };

  const openHistoryLocation = (filePath: string): void => {
    void openContainingFolder(filePath).catch((error: unknown) => {
      setAppError(messageFromError(error));
    });
  };

  const copyHistoryUrl = (url: string): void => {
    void copyToClipboard(url).catch((error: unknown) => {
      setAppError(messageFromError(error));
    });
  };

  if (configState.loading || configState.config === null) {
    return (
      <InkBox flexDirection="column">
        <Text color={theme.colors.primary}>{en.app.name}</Text>
        <Text color={theme.colors.textSecondary}>{configState.loading ? en.common.loading : configState.error ?? en.common.error}</Text>
        <StatusBar />
      </InkBox>
    );
  }

  if (appError !== null) {
    return (
      <InkBox flexDirection="column">
        <Header title={en.common.error} version={version} update={updateState.update} />
        <Text color={theme.colors.error}>{appError}</Text>
        <Menu
          items={[
            { label: en.common.back, value: "back" },
            { label: en.common.backHome, value: "home" }
          ]}
          onSelect={(value) => {
            setAppError(null);
            if (value === "home") {
              navigation.home();
            } else {
              navigation.back();
            }
          }}
        />
        <StatusBar />
      </InkBox>
    );
  }

  if (navigation.screen === "home") {
    return (
      <HomeScreen
        version={version}
        downloadDir={configState.config.downloadDir}
        update={updateState.update}
        onNavigate={navigate}
        onQuit={exit}
      />
    );
  }

  if (navigation.screen === "download") {
    return (
      <DownloadScreen
        version={version}
        update={updateState.update}
        url={download.url}
        status={download.status}
        error={download.error}
        onUrlChange={download.setUrl}
        onSubmit={(value) => {
          void loadUrlAndRoute(value);
        }}
        onBack={navigation.home}
      />
    );
  }

  if (navigation.screen === "playlist" && download.playlist !== null) {
    return (
      <PlaylistScreen
        version={version}
        update={updateState.update}
        playlist={download.playlist}
        loading={download.status === "loading"}
        error={download.error}
        onContinue={continuePlaylist}
        onBack={navigation.back}
      />
    );
  }

  if (navigation.screen === "format" && download.metadata !== null) {
    return (
      <FormatScreen
        version={version}
        update={updateState.update}
        metadata={download.metadata}
        availableFormats={download.availableFormats}
        onSelect={chooseFormat}
        onBack={navigation.back}
      />
    );
  }

  if (navigation.screen === "quality" && download.metadata !== null) {
    return (
      <QualityScreen
        version={version}
        update={updateState.update}
        metadata={download.metadata}
        availableQualities={download.availableQualities}
        onSelect={chooseQuality}
        onBack={navigation.back}
      />
    );
  }

  if (navigation.screen === "subtitle" && download.metadata !== null) {
    return <SubtitleScreen version={version} update={updateState.update} metadata={download.metadata} onSelect={chooseSubtitle} onBack={navigation.back} />;
  }

  if (
    navigation.screen === "confirm" &&
    download.metadata !== null &&
    download.selectedFormat !== null &&
    download.selectedQuality !== null
  ) {
    return (
      <ConfirmScreen
        version={version}
        update={updateState.update}
        config={configState.config}
        metadata={download.metadata}
        format={download.selectedFormat}
        quality={download.selectedQuality}
        subtitleMode={download.selectedSubtitleMode}
        filenamePreview={download.filenamePreview}
        loading={download.status === "loading"}
        error={download.error}
        onStart={startDownload}
        onBack={navigation.back}
      />
    );
  }

  if (navigation.screen === "progress") {
    return (
      <ProgressScreen
        version={version}
        update={updateState.update}
        status={download.status}
        progress={download.progress}
        error={download.error}
        logLines={download.logLines}
        completedFilePath={download.completedFilePath}
        onOpenFolder={openCompletedFolder}
        onDownloadAnother={downloadAnother}
        onHome={navigation.home}
      />
    );
  }

  if (navigation.screen === "history") {
    return (
      <HistoryScreen
        version={version}
        update={updateState.update}
        entries={historyState.entries}
        error={historyState.error ?? appError}
        onRedownload={redownload}
        onOpenLocation={openHistoryLocation}
        onCopyUrl={copyHistoryUrl}
        onDelete={(date) => {
          void historyState.deleteEntry(date);
        }}
        onBack={navigation.home}
      />
    );
  }

  if (navigation.screen === "settings") {
    return (
      <SettingsScreen
        version={version}
        update={updateState.update}
        config={configState.config}
        error={configState.error}
        onUpdate={configState.updateConfig}
        onReset={configState.reset}
        onBack={navigation.home}
      />
    );
  }

  if (navigation.screen === "update") {
    return (
      <UpdateScreen
        version={version}
        update={updateState.update}
        checking={updateState.checking}
        onCheck={() => {
          void updateState.checkNow();
        }}
        onBack={navigation.home}
      />
    );
  }

  if (navigation.screen === "about") {
    return <AboutScreen version={version} update={updateState.update} onBack={navigation.home} />;
  }

  return (
    <InkBox flexDirection="column">
      <Header title={en.common.error} version={version} update={updateState.update} />
      <Text color={theme.colors.error}>{en.common.error}</Text>
      <Menu items={[{ label: en.common.backHome, value: "home" }]} onSelect={navigation.home} />
      <StatusBar />
    </InkBox>
  );
}
