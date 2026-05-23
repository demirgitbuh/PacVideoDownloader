import type { SubtitleMode, UpdateCheckResult, VideoMetadata } from "../types/index.js";
interface SubtitleScreenProps {
    version: string;
    update: UpdateCheckResult;
    metadata: VideoMetadata;
    onSelect: (mode: SubtitleMode) => void;
    onBack: () => void;
}
export default function SubtitleScreen({ version, update, metadata, onSelect, onBack }: SubtitleScreenProps): JSX.Element;
export {};
