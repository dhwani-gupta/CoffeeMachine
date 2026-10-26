import type { CupStyle, Drink, DrinkId } from "../types";

export const DRINKS: readonly Drink[] = [
  {
    id: "cappuccino",
    name: "Cappuccino",
    note: "velvety foam",
    bars: 9,
    liquid: "linear-gradient(180deg, #a1602d 0%, #6b3a18 45%, #2d1408 100%)",
    crema: "#d5a065",
  },
  {
    id: "espresso",
    name: "Espresso",
    note: "short & bold",
    bars: 12,
    liquid: "linear-gradient(180deg, #6d3513 0%, #3b1a09 55%, #160802 100%)",
    crema: "#b97c3f",
  },
  {
    id: "latte",
    name: "Caffè Latte",
    note: "silky & mellow",
    bars: 7,
    liquid: "linear-gradient(180deg, #c79a68 0%, #8a5730 50%, #43220f 100%)",
    crema: "#e4c59b",
  },
  {
    id: "mocha",
    name: "Hot Mocha",
    note: "cocoa comfort",
    bars: 8,
    liquid: "linear-gradient(180deg, #5e3018 0%, #38190b 55%, #1a0a04 100%)",
    crema: "#a9743f",
  },
];

export const DRINK_MAP = Object.fromEntries(
  DRINKS.map((drink) => [drink.id, drink]),
) as Record<DrinkId, Drink>;

export const CUP_STYLES: readonly CupStyle[] = [
  {
    id: "porcelain",
    name: "Porcelain",
    light: "#fffdf8",
    dark: "#ded4c4",
    handle: "#f3ede3",
    glow: "#f5e5cf",
  },
  {
    id: "sage",
    name: "Sage",
    light: "#e2ede0",
    dark: "#a9c1aa",
    handle: "#cfdfcf",
    glow: "#b7d8bd",
  },
  {
    id: "terracotta",
    name: "Terracotta",
    light: "#eeb197",
    dark: "#bd7457",
    handle: "#dfa085",
    glow: "#e39170",
  },
  {
    id: "cobalt",
    name: "Cobalt",
    light: "#b5c9e9",
    dark: "#6c86b3",
    handle: "#9db4d8",
    glow: "#8ba7d6",
  },
  {
    id: "honey",
    name: "Honey",
    light: "#f7e2ab",
    dark: "#d0aa60",
    handle: "#eccd8e",
    glow: "#e7c47a",
  },
  {
    id: "rose",
    name: "Rose",
    light: "#f4d2d2",
    dark: "#cb989c",
    handle: "#e9b9bc",
    glow: "#e3a9ac",
  },
];

export const CUP_MAP = Object.fromEntries(
  CUP_STYLES.map((cup) => [cup.id, cup]),
) as Record<CupStyle["id"], CupStyle>;

export interface DurationPreset {
  id: string;
  label: string;
  hint: string;
  ms: number;
}

export const FOCUS_PRESETS: readonly DurationPreset[] = [
  { id: "focus25", label: "25 min", hint: "Classic", ms: 25 * 60_000 },
  { id: "focus50", label: "50 min", hint: "Deep work", ms: 50 * 60_000 },
  { id: "demo", label: "10 sec", hint: "Preview", ms: 10_000 },
];

export const BREAK_PRESETS: readonly DurationPreset[] = [
  { id: "break5", label: "5 min", hint: "Quick rest", ms: 5 * 60_000 },
  { id: "break10", label: "10 min", hint: "Proper pause", ms: 10 * 60_000 },
  { id: "break15", label: "15 min", hint: "Slow coffee", ms: 15 * 60_000 },
  { id: "breakdemo", label: "10 sec", hint: "Preview", ms: 10_000 },
];

export const SERVICE_MESSAGES: readonly string[] = [
  "Serving table 4 · one flat white",
  "Steaming oat milk for the bar",
  "Refilling the bean hopper",
  "Wiping down the counter",
  "Serving other customers",
  "Pulling a double shot",
  "Restocking the pastry case",
  "Catching up with a regular",
];

export const SIPS_PER_CUP = 5;
export const SIP_SIZE = 1 / SIPS_PER_CUP;

export const MIN_FOCUS_MINUTES = 1;
export const MAX_FOCUS_MINUTES = 120;
export const MIN_BREAK_MINUTES = 1;
export const MAX_BREAK_MINUTES = 30;

export const DEFAULT_FOCUS_MS = 25 * 60_000;
export const DEFAULT_BREAK_MS = 5 * 60_000;
