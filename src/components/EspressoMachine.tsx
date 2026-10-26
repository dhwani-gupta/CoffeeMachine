import { useState } from "react";
import type { DragEvent } from "react";
import { Cup } from "./Cup";
import type { CupSpot, CupStyle, Drink, MachineSnapshot } from "../types";

interface EspressoMachineProps {
  snapshot: MachineSnapshot;
  drink: Drink;
  cupStyle: CupStyle;
  coffeeReady: boolean;
  fill: number;
  serviceMessage: string;
  cupSpot: CupSpot;
  cupLocked: boolean;
  cupDisabled: boolean;
  onCupActivate: () => void;
  onCupDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onTrayDrop: () => void;
}

function lcdCopy(
  snapshot: MachineSnapshot,
  drink: Drink,
  serviceMessage: string,
  cupSpot: CupSpot,
) {
  const { mode, phase } = snapshot;

  if (mode === "break") {
    if (phase === "running") {
      return {
        main: "On break · café service",
        sub: serviceMessage,
      };
    }
    if (phase === "paused") {
      return {
        main: "Break paused",
        sub: "The counter is on hold",
      };
    }
    return {
      main: "Break complete · reset",
      sub: "Cup clear · ready for focus",
    };
  }

  if (phase === "running") {
    return {
      main: "Coffee making in progress",
      sub: `${drink.name} · extraction ${drink.bars.toFixed(1)} bar`,
    };
  }
  if (phase === "paused") {
    return {
      main: "Brew paused",
      sub: "Resume or dump the shot",
    };
  }
  if (phase === "complete") {
    return {
      main: "Coffee served · ready",
      sub: `${drink.name} is ready · start break`,
    };
  }
  if (cupSpot === "tray") {
    return {
      main: "Ready for extraction",
      sub: "Press start focus on the pad",
    };
  }
  return {
    main: "Standby: ready",
    sub: "Place mug on tray to brew",
  };
}

export function EspressoMachine({
  snapshot,
  drink,
  cupStyle,
  coffeeReady,
  fill,
  serviceMessage,
  cupSpot,
  cupLocked,
  cupDisabled,
  onCupActivate,
  onCupDragStart,
  onTrayDrop,
}: EspressoMachineProps) {
  const [dragActive, setDragActive] = useState(false);

  const isBreak = snapshot.mode === "break";
  const isFocusRunning = !isBreak && snapshot.phase === "running";
  const isPouring =
    isFocusRunning && snapshot.cycle === "pour" && cupSpot === "tray";
  const isSteamingCup =
    (isFocusRunning && snapshot.cycle === "steam") || coffeeReady;
  const isSteamWandOn = isBreak && snapshot.phase === "running";
  const copy = lcdCopy(snapshot, drink, serviceMessage, cupSpot);

  const gaugeAngle = isFocusRunning
    ? -120 + drink.bars * 12
    : snapshot.phase === "paused"
      ? -55
      : -120;
  const gaugeValue = isFocusRunning ? drink.bars.toFixed(1) : "0.0";
  const meterProgress = snapshot.phase === "idle" ? 0 : snapshot.progress;

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (cupLocked || cupSpot === "tray") return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragActive(true);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (cupLocked) return;
    onTrayDrop();
  };

  return (
    <section
      className={`espresso-machine${isBreak ? " is-break" : ""}${
        dragActive ? " is-target" : ""
      }`}
      data-phase={snapshot.phase}
      data-mode={snapshot.mode}
      aria-label={`Commercial espresso machine · ${drink.name} selected`}
    >
      <div className="machine-top" aria-hidden="true">
        <span className="machine-top__rail" />
        <span className="machine-top__grille" />
        <span className="machine-top__screw machine-top__screw--l" />
        <span className="machine-top__screw machine-top__screw--r" />
      </div>

      <div className="machine-shell">
        <div className="machine-brand">
          <span className="machine-brand__logo">
            Officina <em>Pomodoro</em>
          </span>
          <span className="machine-brand__model">Leva · Duetto</span>
          <span
            className="machine-resources"
            title="Water and coffee beans remaining on board"
          >
            {snapshot.waterMl} ml · {snapshot.beansG} g
          </span>
        </div>

        <div className="machine-panel">
          <div
            className="gauge"
            role="img"
            aria-label={`Pressure gauge reading ${gaugeValue} bar`}
            title={`Chamber pressure: ${gaugeValue} bar`}
          >
            <span className="gauge-label">bar</span>
            <span
              className="gauge-needle"
              style={{ transform: `rotate(${gaugeAngle}deg)` }}
            />
            <span className="gauge-pin" />
            <span className="gauge-value">{gaugeValue}</span>
          </div>

          <div className="lcd" role="status" aria-live="polite">
            <span className="lcd-main">{copy.main}</span>
            <span className="lcd-sub">{copy.sub}</span>
            <span className="lcd-meter" aria-hidden="true">
              <span style={{ width: `${Math.round(meterProgress * 100)}%` }} />
            </span>
          </div>

          <div className="machine-toggles" aria-hidden="true">
            <span className="led led--power" />
            <span className="toggle toggle--up" />
            <span className="toggle" />
            <span className="toggle-caption">steam</span>
          </div>
        </div>

        <div
          className="brew-deck"
          onDragOver={handleDragOver}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <div className="group-head" aria-hidden="true">
            <span className="group-head__collar" />
            <span className="group-head__spout" />
          </div>

          <div className="portafilter" aria-hidden="true">
            <span className="portafilter__basket" />
            <span className="portafilter__handle" />
          </div>

          <div
            className={`pour${isPouring ? " is-flowing" : ""}`}
            aria-hidden="true"
          />

          <div
            className={`steam-wand${isSteamWandOn ? " is-on" : ""}`}
            aria-hidden="true"
          >
            <span className="steam-wand__knob" />
            <span className="steam-wand__pipe" />
            <span className="steam-wand__tip" />
          </div>

          <div className="water-wand" aria-hidden="true">
            <span className="water-wand__pipe" />
            <span className="water-wand__tip" />
          </div>

          <div className="drip-area">
            <div className="drip-tray" aria-hidden="true">
              <span className="drip-tray__grate" />
              <span className="drip-tray__brand">Officina</span>
            </div>

            <div className="cup-platform">
              {cupSpot === "tray" ? (
                <Cup
                  drink={drink}
                  cupStyle={cupStyle}
                  fill={fill}
                  spot="tray"
                  locked={cupLocked}
                  disabled={cupDisabled}
                  serving={coffeeReady}
                  steaming={isSteamingCup}
                  finished={coffeeReady}
                  onActivate={onCupActivate}
                  onDragStart={onCupDragStart}
                />
              ) : (
                <div className="tray-hint">
                  <span>Place mug</span>
                  <small>drag or tap</small>
                </div>
              )}
            </div>
          </div>

          <span className="deck-glow" aria-hidden="true" />
          <span className={`deck-steam${isSteamWandOn ? " is-on" : ""}`} aria-hidden="true" />
        </div>

        <div className="machine-foot">
          <span className="machine-foot__led" aria-hidden="true" />
          <span className="machine-foot__label">
            officina pomodoro · made for slow work
          </span>
          <span className="machine-foot__legs" aria-hidden="true">
            <span />
            <span />
          </span>
        </div>
      </div>

      <span className="visually-hidden">
        {isFocusRunning
          ? `Brewing ${drink.name}. ${Math.round(snapshot.progress * 100)} percent complete.`
          : null}
        {isBreak && snapshot.phase === "running"
          ? `On break. ${serviceMessage}.`
          : null}
      </span>
    </section>
  );
}
