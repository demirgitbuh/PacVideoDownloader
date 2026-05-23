import type { ScreenName, UpdateCheckResult } from "../types/index.js";
interface HomeScreenProps {
    version: string;
    downloadDir: string;
    update: UpdateCheckResult;
    onNavigate: (screen: ScreenName) => void;
    onQuit: () => void;
}
export default function HomeScreen({ version, downloadDir, update, onNavigate, onQuit }: HomeScreenProps): JSX.Element;
export {};
