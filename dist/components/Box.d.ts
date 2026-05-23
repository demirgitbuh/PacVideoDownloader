import type { ReactNode } from "react";
interface BoxProps {
    title?: string;
    children: ReactNode;
}
export default function Box({ title, children }: BoxProps): JSX.Element;
export {};
