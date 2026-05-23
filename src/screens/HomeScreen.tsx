import { Box as InkBox, Text } from "ink";
import Header from "../components/Header.js";
import Logo from "../components/Logo.js";
import Menu from "../components/Menu.js";
import StatusBar from "../components/StatusBar.js";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";
import type { MenuItem, ScreenName, UpdateCheckResult } from "../types/index.js";

interface HomeScreenProps {
  version: string;
  downloadDir: string;
  update: UpdateCheckResult;
  onNavigate: (screen: ScreenName) => void;
  onQuit: () => void;
}

type HomeValue = ScreenName | "quit";

export default function HomeScreen({ version, downloadDir, update, onNavigate, onQuit }: HomeScreenProps): JSX.Element {
  const items: Array<MenuItem<HomeValue>> = [
    { label: en.home.menu.download, value: "download" },
    { label: en.home.menu.history, value: "history" },
    { label: en.home.menu.settings, value: "settings" },
    { label: en.home.menu.update, value: "update" },
    { label: en.home.menu.about, value: "about" },
    { label: en.home.menu.quit, value: "quit" }
  ];

  return (
    <InkBox flexDirection="column">
      <Header title={en.screen.home} version={version} update={update} />
      <Logo />
      <Text color={theme.colors.textSecondary}>{en.app.version(version)}</Text>
      <Text color={theme.colors.textSecondary}>{en.app.downloadPath(downloadDir)}</Text>
      <InkBox marginTop={1}>
        <Menu
          items={items}
          onSelect={(value) => {
            if (value === "quit") {
              onQuit();
            } else {
              onNavigate(value);
            }
          }}
        />
      </InkBox>
      <StatusBar />
    </InkBox>
  );
}
