export type DrinkId = "cappuccino" | "espresso" | "latte" | "mocha";

export interface Drink {
  id: DrinkId;
  name: string;
  note: string;
  bars: number;
  /** CSS gradient used for the liquid inside the mug. */
  liquid: string;
  /** Colour of the crema layer on top of the liquid. */
  crema: string;
}

export type CupId =
  | "porcelain"
  | "sage"
  | "terracotta"
  | "cobalt"
  | "honey"
  | "rose";

export interface CupStyle {
  id: CupId;
  name: string;
  light: string;
  dark: string;
  handle: string;
  glow: string;
}

/** The two halves of a pomodoro session. */
export type TimerMode = "focus" | "break";

export type MachinePhase = "idle" | "running" | "paused" | "complete";

export type BrewCycle = "pour" | "steam";

export interface MachineSnapshot {
  phase: MachinePhase;
  mode: TimerMode;
  drinkId: DrinkId;
  totalMs: number;
  remainingMs: number;
  /** 0 → 1 */
  progress: number;
  cycle: BrewCycle;
  waterMl: number;
  beansG: number;
}

export type Screen = "welcome" | "desk" | "exit";

export type CupSpot = "coaster" | "tray";
