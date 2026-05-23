import type { ScreenName } from "../types/index.js";
interface UseNavigationResult {
    screen: ScreenName;
    go: (screen: ScreenName) => void;
    back: () => void;
    home: () => void;
}
export default function useNavigation(initialScreen: ScreenName): UseNavigationResult;
export {};
