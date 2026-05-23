import type { UpdateCheckResult } from "../types/index.js";
interface UpdateBadgeProps {
    update: UpdateCheckResult;
}
export default function UpdateBadge({ update }: UpdateBadgeProps): JSX.Element | null;
export {};
