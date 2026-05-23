import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import { en } from "../locales/en.js";
import { theme } from "../lib/theme.js";

export default function Logo(): JSX.Element {
  return (
    <Gradient colors={[theme.colors.primary, theme.colors.primaryBright]}>
      <BigText text={en.app.logo} />
    </Gradient>
  );
}
