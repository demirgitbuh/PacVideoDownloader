import type { UpdateCheckResult } from "../types/index.js";
interface HeaderProps {
    title: string;
    version: string;
    update: UpdateCheckResult;
}
export default function Header({ title, version, update }: HeaderProps): JSX.Element;
export {};
