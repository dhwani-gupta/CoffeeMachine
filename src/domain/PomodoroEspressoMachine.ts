import type { DrinkId, MachineSnapshot, TimerMode } from "../types";

export interface MachineEvents {
  onUpdate?: (snapshot: MachineSnapshot) => void;
  onComplete?: (snapshot: MachineSnapshot) => void;
}

const TICK_MS = 200;
const POUR_SECONDS = 3;
const CYCLE_SECONDS = 5;

export const INITIAL_MACHINE_SNAPSHOT: MachineSnapshot = {
  phase: "idle",
  mode: "focus",
  drinkId: "cappuccino",
  totalMs: 0,
  remainingMs: 0,
  progress: 0,
  cycle: "pour",
  waterMl: 1000,
  beansG: 250,
};

/**
 * A small abstraction around a brewing appliance. The UI only talks to this
 * public interface; the concrete machine privately owns its timer, reserves and
 * focus/break modes.
 */
export abstract class BaseBrewingAppliance {
  readonly model: string;

  protected constructor(model: string) {
    this.model = model;
  }

  abstract startFocusSession(drinkId: DrinkId, durationMs: number): boolean;
  abstract startBreakSession(durationMs: number): boolean;
  abstract pauseSession(): boolean;
  abstract resumeSession(): boolean;
  abstract stopSession(): boolean;
  abstract resetSession(): void;
  abstract extendSession(extraMs: number): boolean;
}

export class PomodoroEspressoMachine extends BaseBrewingAppliance {
  #events: MachineEvents;
  #phase: MachineSnapshot["phase"] = "idle";
  #mode: TimerMode = "focus";
  #drinkId: DrinkId = "cappuccino";
  #totalMs = 0;
  #remainingMs = 0;
  #deadline = 0;
  #timer: number | null = null;
  #waterMl = 1000;
  #beansG = 250;

  constructor(events: MachineEvents) {
    super("Officina · Pomodoro Series");
    this.#events = events;
  }

  get snapshot(): MachineSnapshot {
    return this.#buildSnapshot();
  }

  get getResourceMetrics(): { water: string; beans: string; inProgress: boolean } {
    return {
      water: `${this.#waterMl}ml`,
      beans: `${this.#beansG}g`,
      inProgress: this.#isBusy(),
    };
  }

  startFocusSession(drinkId: DrinkId, durationMs: number): boolean {
    if (this.#isBusy()) return false;
    if (this.#mode === "focus" && this.#phase === "complete") return false;

    this.#mode = "focus";
    this.#drinkId = drinkId;
    this.#totalMs = Math.max(1000, Math.round(durationMs));
    this.#remainingMs = this.#totalMs;
    this.#deadline = performance.now() + this.#totalMs;
    this.#phase = "running";

    this.#waterMl = Math.max(0, this.#waterMl - 50);
    this.#beansG = Math.max(0, this.#beansG - 18);

    this.#emit();
    this.#startTicking();
    return true;
  }

  startBreakSession(durationMs: number): boolean {
    if (this.#isBusy()) return false;
    if (this.#mode !== "focus" || this.#phase !== "complete") return false;

    this.#mode = "break";
    this.#totalMs = Math.max(1000, Math.round(durationMs));
    this.#remainingMs = this.#totalMs;
    this.#deadline = performance.now() + this.#totalMs;
    this.#phase = "running";

    this.#emit();
    this.#startTicking();
    return true;
  }

  pauseSession(): boolean {
    if (this.#phase !== "running") return false;

    this.#remainingMs = Math.max(0, this.#deadline - performance.now());
    this.#clearTicking();
    this.#phase = "paused";
    this.#emit();
    return true;
  }

  resumeSession(): boolean {
    if (this.#phase !== "paused") return false;

    this.#deadline = performance.now() + this.#remainingMs;
    this.#phase = "running";
    this.#emit();
    this.#startTicking();
    return true;
  }

  stopSession(): boolean {
    if (!this.#isBusy()) return false;

    this.#clearTicking();
    this.#mode = "focus";
    this.#phase = "idle";
    this.#totalMs = 0;
    this.#remainingMs = 0;
    this.#emit();
    return true;
  }

  /** Return to standby without touching the cup (used when leaving the desk). */
  resetSession(): void {
    this.#clearTicking();
    this.#mode = "focus";
    this.#phase = "idle";
    this.#totalMs = 0;
    this.#remainingMs = 0;
    this.#emit();
  }

  /** Adds time to a running or paused session (e.g. "extend break +5 min"). */
  extendSession(extraMs: number): boolean {
    if (!this.#isBusy() || extraMs <= 0) return false;

    const extra = Math.round(extraMs);
    this.#totalMs += extra;
    this.#remainingMs += extra;
    if (this.#phase === "running") {
      this.#deadline += extra;
    }
    this.#emit();
    return true;
  }

  dispose(): void {
    this.#clearTicking();
  }

  #isBusy(): boolean {
    return this.#phase === "running" || this.#phase === "paused";
  }

  #startTicking(): void {
    this.#clearTicking();
    this.#timer = window.setInterval(this.#tick, TICK_MS);
  }

  #clearTicking(): void {
    if (this.#timer !== null) {
      window.clearInterval(this.#timer);
      this.#timer = null;
    }
  }

  #tick = (): void => {
    if (this.#phase !== "running") return;

    this.#remainingMs = Math.max(0, this.#deadline - performance.now());

    if (this.#remainingMs <= 0) {
      this.#clearTicking();
      this.#phase = "complete";
      this.#remainingMs = 0;
      const snapshot = this.#buildSnapshot();
      this.#events.onUpdate?.(snapshot);
      this.#events.onComplete?.(snapshot);
      return;
    }

    this.#emit();
  };

  #emit(): void {
    this.#events.onUpdate?.(this.#buildSnapshot());
  }

  #buildSnapshot(): MachineSnapshot {
    const elapsedMs = Math.max(0, this.#totalMs - this.#remainingMs);
    const elapsedSeconds = elapsedMs / 1000;

    return {
      phase: this.#phase,
      mode: this.#mode,
      drinkId: this.#drinkId,
      totalMs: this.#totalMs,
      remainingMs: this.#remainingMs,
      progress:
        this.#phase === "complete"
          ? 1
          : this.#totalMs > 0
            ? Math.min(1, Math.max(0, elapsedMs / this.#totalMs))
            : 0,
      cycle:
        this.#mode === "focus" &&
        elapsedSeconds % CYCLE_SECONDS < POUR_SECONDS
          ? "pour"
          : "steam",
      waterMl: this.#waterMl,
      beansG: this.#beansG,
    };
  }
}
