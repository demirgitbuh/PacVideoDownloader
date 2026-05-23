import type { MediaFormat, UpdateCheckResult, VideoMetadata } from "../types/index.js";
interface FormatScreenProps {
    version: string;
    update: UpdateCheckResult;
    metadata: VideoMetadata;
    availableFormats: MediaFormat[];
    onSelect: (format: MediaFormat) => void;
    onBack: () => void;
}
export default function FormatScreen({ version, update, metadata, availableFormats, onSelect, onBack }: FormatScreenProps): JSX.Element;
export {};
