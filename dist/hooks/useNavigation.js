import { useCallback, useState } from "react";
export default function useNavigation(initialScreen) {
    const [stack, setStack] = useState([initialScreen]);
    const screen = stack[stack.length - 1] ?? initialScreen;
    const go = useCallback((nextScreen) => {
        setStack((current) => [...current, nextScreen]);
    }, []);
    const back = useCallback(() => {
        setStack((current) => (current.length > 1 ? current.slice(0, -1) : current));
    }, []);
    const home = useCallback(() => {
        setStack(["home"]);
    }, []);
    return { screen, go, back, home };
}
//# sourceMappingURL=useNavigation.js.map