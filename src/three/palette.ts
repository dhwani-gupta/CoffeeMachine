import type { DrinkId } from "../types";

export const COFFEE_COLORS: Record<
  DrinkId,
  { liquid: string; crema: string; glass: string }
> = {
  cappuccino: {
    liquid: "#5d3318",
    crema: "#c99560",
    glass: "#7f4c26",
  },
  espresso: {
    liquid: "#35180a",
    crema: "#b77a3d",
    glass: "#5c2d13",
  },
  latte: {
    liquid: "#7b4b29",
    crema: "#e0c39a",
    glass: "#98673c",
  },
  mocha: {
    liquid: "#3b1c0d",
    crema: "#a77443",
    glass: "#63331a",
  },
};
