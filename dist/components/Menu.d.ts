import type { MenuItem } from "../types/index.js";
interface MenuProps<TValue extends string> {
    items: Array<MenuItem<TValue>>;
    onSelect: (value: TValue) => void;
    isActive?: boolean;
}
export default function Menu<TValue extends string>({ items, onSelect, isActive }: MenuProps<TValue>): JSX.Element;
export {};
