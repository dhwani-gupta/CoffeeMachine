import type { CSSProperties } from "react";
import type { CupStyle } from "../types";

/** CSS custom properties consumed by the ceramic cup styles. */
export function cupStyleVars(cup: CupStyle): CSSProperties {
  return {
    "--cup-light": cup.light,
    "--cup-dark": cup.dark,
    "--cup-handle": cup.handle,
    "--cup-glow": cup.glow,
  } as CSSProperties;
}
