import type { AppConfig, MediaFormat, Quality, SubtitleMode, UpdateCheckResult, VideoMetadata } from "../types/index.js";
interface ConfirmScreenProps {
    version: string;
    update: UpdateCheckResult;
    config: AppConfig;
    metadata: VideoMetadata;
    format: MediaFormat;
    quality: Quality;
    subtitleMode: SubtitleMode;
    filenamePreview: string | null;
    loading: boolean;
    error: string | null;
    onStart: () => void;
    onBack: () => void;
}
export default function ConfirmScreen({ version, update, config, metadata, format, quality, subtitleMode, filenamePreview, loading, error, onStart, onBack }: ConfirmScreenProps): JSX.Element;
export {};
