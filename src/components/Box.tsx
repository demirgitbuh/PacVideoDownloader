import { Box as InkBox, Text } from "ink";
import type { ReactNode } from "react";
import { theme } from "../lib/theme.js";

interface BoxProps {
  title?: string;
  children: ReactNode;
}

export default function Box({ title, children }: BoxProps): JSX.Element {
  return (
    <InkBox borderStyle="round" borderColor={theme.colors.borderSubtle} flexDirection="column" paddingX={1} paddingY={0}>
      {title !== undefined && <Text color={theme.colors.primary}>{title}</Text>}
      {children}
    </InkBox>
  );
}
