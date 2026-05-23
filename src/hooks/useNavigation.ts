import { useCallback, useState } from "react";
import type { ScreenName } from "../types/index.js";

interface UseNavigationResult {
  screen: ScreenName;
  go: (screen: ScreenName) => void;
  back: () => void;
  home: () => void;
}

export default function useNavigation(initialScreen: ScreenName): UseNavigationResult {
  const [stack, setStack] = useState<ScreenName[]>([initialScreen]);
  const screen = stack[stack.length - 1] ?? initialScreen;

  const go = useCallback((nextScreen: ScreenName): void => {
    setStack((current) => [...current, nextScreen]);
  }, []);

  const back = useCallback((): void => {
    setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }, []);

  const home = useCallback((): void => {
    setStack(["home"]);
  }, []);

  return { screen, go, back, home };
}
