import type { Quality, UpdateCheckResult, VideoMetadata } from "../types/index.js";
interface QualityScreenProps {
    version: string;
    update: UpdateCheckResult;
    metadata: VideoMetadata;
    availableQualities: Array<{
        quality: Quality;
        available: boolean;
    }>;
    onSelect: (quality: Quality) => void;
    onBack: () => void;
}
export default function QualityScreen({ version, update, metadata, availableQualities, onSelect, onBack }: QualityScreenProps): JSX.Element;
export {};
