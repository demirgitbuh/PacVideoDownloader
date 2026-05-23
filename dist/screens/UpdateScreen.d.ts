import type { UpdateCheckResult } from "../types/index.js";
interface UpdateScreenProps {
    version: string;
    update: UpdateCheckResult;
    checking: boolean;
    onCheck: () => void;
    onBack: () => void;
}
export default function UpdateScreen({ version, update, checking, onCheck, onBack }: UpdateScreenProps): JSX.Element;
export {};
