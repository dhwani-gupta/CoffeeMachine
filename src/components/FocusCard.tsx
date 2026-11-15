import { SIPS_PER_CUP } from "../data/cafe";
import { formatClock, formatDuration } from "../lib/format";
import type {
  CupSpot,
  CupStyle,
  Drink,
  MachineSnapshot,
} from "../types";
import {
  IconCup,
  IconPause,
  IconPlay,
  IconSliders,
  IconStop,
} from "./icons";

interface FocusCardProps {
  snapshot: MachineSnapshot;
  drink: Drink;
  cupStyle: CupStyle;
  focusDurationMs: number;
  breakDurationMs: number;
  sessions: number;
  cupSpot: CupSpot;
  coffeeLevel: number;
  serviceMessage: string;
  onPrimary: () => void;
  onStop: () => void;
  onSip: () => void;
  onExtendBreak: () => void;
  onOpenOrder: () => void;
}

function phaseCopy(
  snapshot: MachineSnapshot,
  drink: Drink,
  cupSpot: CupSpot,
  coffeeLevel: number,
): { eyebrow: string; tag: string; copy: string; tone: string } {
  if (snapshot.mode === "break") {
    if (snapshot.phase === "running") {
      return {
        eyebrow: "Barista break",
        tag: "Café service",
        copy:
          coffeeLevel > 0
            ? "The counter is covered. Sip slowly and let the room work for a minute."
            : "Cup finished. The café has the rest of your break covered.",
        tone: "break",
      };
    }
    if (snapshot.phase === "paused") {
      return {
        eyebrow: "Barista break",
        tag: "On hold",
        copy: "Break paused. The café will wait for you.",
        tone: "break",
      };
    }
    if (snapshot.phase === "complete") {
      return {
        eyebrow: "Barista break",
        tag: "Cup cleared",
        copy: "Break complete. The cup is cleared and the counter is ready again.",
        tone: "muted",
      };
    }
    return {
      eyebrow: "Barista break",
      tag: "Ready",
      copy: "The café is covered whenever you are ready.",
      tone: "break",
    };
  }

  if (snapshot.phase === "running") {
    return {
      eyebrow: "Focus session",
      tag: "Brewing",
      copy: `The machine is pulling your ${drink.name.toLowerCase()}. Stay with the work.`,
      tone: "focus",
    };
  }
  if (snapshot.phase === "paused") {
    return {
      eyebrow: "Focus session",
      tag: "Held",
      copy: "The shot is held exactly where it is. Resume when you are ready.",
      tone: "focus",
    };
  }
  if (snapshot.phase === "complete") {
    return {
      eyebrow: "Focus session",
      tag: "Coffee served",
      copy: `${drink.name} is on the tray. Start the break, then sip at your own pace.`,
      tone: "ready",
    };
  }
  return {
    eyebrow: "Focus session",
    tag: "Ready",
    copy:
      cupSpot === "coaster"
        ? "Choose a mug on the wall, then load it onto the machine."
        : "Everything is loaded. Start the focus whenever you are ready.",
    tone: "idle",
  };
}

export function FocusCard({
  snapshot,
  drink,
  cupStyle,
  focusDurationMs,
  breakDurationMs,
  sessions,
  cupSpot,
  coffeeLevel,
  serviceMessage,
  onPrimary,
  onStop,
  onSip,
  onExtendBreak,
  onOpenOrder,
}: FocusCardProps) {
  const isBreak = snapshot.mode === "break";
  const busy = snapshot.phase === "running" || snapshot.phase === "paused";
  const paused = snapshot.phase === "paused";
  const focusComplete = snapshot.mode === "focus" && snapshot.phase === "complete";
  const breakActive =
    isBreak && (snapshot.phase === "running" || snapshot.phase === "paused");
  const displayMs =
    snapshot.phase === "idle"
      ? isBreak
        ? breakDurationMs
        : focusDurationMs
      : snapshot.remainingMs;
  const progress =
    snapshot.phase === "complete"
      ? 1
      : snapshot.phase === "idle"
        ? 0
        : snapshot.progress;
  const phase = phaseCopy(snapshot, drink, cupSpot, coffeeLevel);
  const sipsLeft = Math.max(0, Math.ceil(coffeeLevel * SIPS_PER_CUP));
  const showCoffee = focusComplete || breakActive;
  const cyclePips = sessions > 0 && sessions % 4 === 0 ? 4 : sessions % 4;

  const primaryIcon = paused ? (
    <IconPlay width={15} height={15} />
  ) : snapshot.phase === "running" ? (
    <IconPause width={15} height={15} />
  ) : focusComplete ? (
    <IconCup width={15} height={15} />
  ) : (
    <IconPlay width={15} height={15} />
  );

  const primaryLabel = paused
    ? isBreak
      ? "Resume break"
      : "Resume focus"
    : snapshot.phase === "running"
      ? isBreak
        ? "Pause break"
        : "Pause focus"
      : focusComplete
        ? `Start break · ${formatDuration(breakDurationMs)}`
        : cupSpot === "coaster"
          ? "Load the mug"
          : `Start focus · ${formatDuration(focusDurationMs)}`;

  const stopLabel = isBreak && busy ? "End break" : "Stop focus";

  return (
    <aside className={`focus-card focus-card--${phase.tone}`} aria-label="Session clock">
      <div className="focus-card__wash" aria-hidden="true" />
      <header className="focus-card__head">
        <span className="focus-card__eyebrow">
          <span className={`focus-card__dot focus-card__dot--${phase.tone}`} aria-hidden="true" />
          {phase.eyebrow}
        </span>
        <span className={`focus-card__tag focus-card__tag--${phase.tone}`}>
          {phase.tag}
        </span>
      </header>

      <div
        className="focus-card__time"
        aria-label={`${formatClock(displayMs)} remaining in ${phase.eyebrow.toLowerCase()}`}
      >
        {formatClock(displayMs)}
      </div>

      <p className="focus-card__copy">{phase.copy}</p>

      {snapshot.mode === "break" && snapshot.phase === "running" ? (
        <p className="focus-card__service" key={serviceMessage}>
          <span aria-hidden="true">—</span> {serviceMessage}
        </p>
      ) : null}

      <div className="focus-card__progress" aria-hidden="true">
        <span
          className={`focus-card__progress-fill focus-card__progress-fill--${phase.tone}`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <div className="focus-card__meta">
        <span>{formatDuration(isBreak ? breakDurationMs : focusDurationMs)}</span>
        <span>{sessions} {sessions === 1 ? "cup" : "cups"} brewed</span>
      </div>

      {showCoffee ? (
        <div className={`focus-card__cup${paused ? " is-paused" : ""}`}>
          <div className="focus-card__cup-head">
            <span>{coffeeLevel > 0 ? drink.name : "Cup finished"}</span>
            <span>{sipsLeft} {sipsLeft === 1 ? "sip" : "sips"} left</span>
          </div>
          <div className="focus-card__sip-track" aria-hidden="true">
            <span style={{ width: `${Math.round(coffeeLevel * 100)}%` }} />
          </div>
          <div className="focus-card__cup-actions">
            <button
              type="button"
              className="focus-card__sip"
              onClick={onSip}
              disabled={coffeeLevel <= 0}
            >
              <IconCup width={14} height={14} />
              Take a sip
            </button>
            {breakActive ? (
              <button
                type="button"
                className="focus-card__extend"
                onClick={onExtendBreak}
                title="Add five minutes to this break"
              >
                +5 min
              </button>
            ) : (
              <span className="focus-card__cup-caption">
                {cupStyle.name} mug · served
              </span>
            )}
          </div>
        </div>
      ) : null}

      <div className="focus-card__actions">
        <button
          type="button"
          className={`focus-card__primary${
            snapshot.phase === "running" ? " is-pause" : ""
          }${isBreak ? " is-break" : ""}${focusComplete ? " is-ready" : ""}`}
          onClick={onPrimary}
        >
          {primaryIcon}
          <span>{primaryLabel}</span>
        </button>
        <button
          type="button"
          className="focus-card__stop"
          onClick={onStop}
          disabled={!busy}
          title={isBreak ? "Finish the break early" : "Stop this focus session"}
        >
          <IconStop width={10} height={10} />
          {stopLabel}
        </button>
      </div>

      <div className="focus-card__footer">
        <div className="focus-card__pips" aria-label={`${sessions} sessions brewed`}>
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={index < cyclePips ? "is-filled" : ""}
              aria-hidden="true"
            />
          ))}
        </div>
        <span>Table 04 · bar seat</span>
      </div>

      <button type="button" className="focus-card__order-link" onClick={onOpenOrder}>
        <IconSliders width={14} height={14} />
        Order &amp; settings
      </button>
    </aside>
  );
}
