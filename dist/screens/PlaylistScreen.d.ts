import type { PlaylistItem, PlaylistMetadata, UpdateCheckResult } from "../types/index.js";
interface PlaylistScreenProps {
    version: string;
    update: UpdateCheckResult;
    playlist: PlaylistMetadata;
    loading: boolean;
    error: string | null;
    onContinue: (items: PlaylistItem[]) => void;
    onBack: () => void;
}
export default function PlaylistScreen({ version, update, playlist, loading, error, onContinue, onBack }: PlaylistScreenProps): JSX.Element;
export {};
