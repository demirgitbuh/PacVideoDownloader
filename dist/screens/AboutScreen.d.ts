import type { UpdateCheckResult } from "../types/index.js";
interface AboutScreenProps {
    version: string;
    update: UpdateCheckResult;
    onBack: () => void;
}
export default function AboutScreen({ version, update, onBack }: AboutScreenProps): JSX.Element;
export {};
