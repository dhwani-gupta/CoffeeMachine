import type { CSSProperties, DragEvent, KeyboardEvent } from "react";
import { SIPS_PER_CUP } from "../data/cafe";
import { cupStyleVars } from "../lib/cup";
import type { CupSpot, CupStyle, Drink } from "../types";

interface CupProps {
  drink: Drink;
  cupStyle: CupStyle;
  fill: number;
  spot: CupSpot;
  /** Movement is locked (no dragging). */
  locked: boolean;
  /** Interaction is locked completely (focus timer running or paused). */
  disabled: boolean;
  serving: boolean;
  steaming: boolean;
  finished: boolean;
  onActivate: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
}

export function Cup({
  drink,
  cupStyle,
  fill,
  spot,
  locked,
  disabled,
  serving,
  steaming,
  finished,
  onActivate,
  onDragStart,
}: CupProps) {
  const fillPercent = Math.min(100, Math.max(0, fill * 100));
  const liquidPercent = Math.min(92, fillPercent * 0.86);
  const sipsLeft = Math.max(0, Math.ceil(fill / (1 / SIPS_PER_CUP)));

  const label = disabled
    ? "The mug stays put while the timer runs."
    : serving && fillPercent > 0
      ? `Your ${drink.name} — ${sipsLeft} ${sipsLeft === 1 ? "sip" : "sips"} left. Tap for a sip.`
      : spot === "tray"
        ? "Mug on the machine tray. Tap to return it to the coaster."
        : "Mug on the coaster. Tap to load it onto the machine.";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  };

  return (
    <div
      className={`cup cup--${spot}${locked ? " is-locked" : ""}${
        disabled ? " is-disabled" : ""
      }${serving ? " is-ready" : ""}${serving && fillPercent > 0 ? " is-sippable" : ""}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={label}
      title={label}
      draggable={!locked}
      onDragStart={onDragStart}
      onClick={onActivate}
      onKeyDown={handleKeyDown}
      style={
        {
          ...cupStyleVars(cupStyle),
          "--cup-fill": `${fillPercent}%`,
        } as CSSProperties
      }
    >
      <div className="cup-handle" aria-hidden="true" />

      <div className="cup-body">
        <div
          className="cup-liquid"
          style={{ height: `${liquidPercent}%`, background: drink.liquid }}
        >
          <div
            className="cup-crema"
            style={{
              background: drink.crema,
              opacity: fillPercent > 28 ? 1 : 0,
            }}
          />
        </div>
        <div className="cup-shine" aria-hidden="true" />
      </div>

      <div
        className={`cup-steam${steaming || finished ? " is-on" : ""}${
          finished ? " is-finished" : ""
        }`}
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </div>

      {finished ? (
        <span className="cup-ready" aria-hidden="true">
          {fillPercent > 0 ? "ready" : "empty"}
        </span>
      ) : null}
    </div>
  );
}
