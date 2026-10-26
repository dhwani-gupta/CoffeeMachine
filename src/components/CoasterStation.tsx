import { useState } from "react";
import type { DragEvent } from "react";
import { Cup } from "./Cup";
import type { CupSpot, CupStyle, Drink, MachineSnapshot } from "../types";

interface CoasterStationProps {
  drink: Drink;
  cupStyle: CupStyle;
  snapshot: MachineSnapshot;
  cupSpot: CupSpot;
  fill: number;
  locked: boolean;
  disabled: boolean;
  coffeeReady: boolean;
  onCupActivate: () => void;
  onCupDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDropCup: () => void;
}

function hintFor(
  snapshot: MachineSnapshot,
  cupSpot: CupSpot,
  coffeeReady: boolean,
): string {
  const busy = snapshot.phase === "running" || snapshot.phase === "paused";

  if (snapshot.mode === "break" && busy) {
    return "You're on break — sip slowly while the café runs itself.";
  }
  if (snapshot.mode === "focus" && snapshot.phase === "complete" && coffeeReady) {
    return "Coffee is served. Start your break, then sip at your own pace.";
  }
  if (snapshot.mode === "break" && snapshot.phase === "complete") {
    return "Break is done. The cup is rinsed and ready for the next focus.";
  }
  if (snapshot.mode === "focus" && busy) {
    return "The mug rests on the tray while you focus.";
  }
  if (cupSpot === "coaster") {
    return "Drag or tap your mug to load the machine.";
  }
  return "Your mug is on the machine. Start focus when you're ready.";
}

export function CoasterStation({
  drink,
  cupStyle,
  snapshot,
  cupSpot,
  fill,
  locked,
  disabled,
  coffeeReady,
  onCupActivate,
  onCupDragStart,
  onDropCup,
}: CoasterStationProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (locked || cupSpot === "coaster") return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragActive(true);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (locked) return;
    onDropCup();
  };

  return (
    <section
      className={`coaster-station${dragActive ? " is-target" : ""}`}
      aria-label="Mug coaster"
      onDragOver={handleDragOver}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <p className="station-hint">
        {hintFor(snapshot, cupSpot, coffeeReady)}
      </p>

      <div className="coaster">
        <div className="cork" aria-hidden="true" />
        {cupSpot === "coaster" ? (
          <Cup
            drink={drink}
            cupStyle={cupStyle}
            fill={fill}
            spot="coaster"
            locked={locked}
            disabled={disabled}
            serving={coffeeReady}
            steaming={coffeeReady}
            finished={coffeeReady}
            onActivate={onCupActivate}
            onDragStart={onCupDragStart}
          />
        ) : (
          <span className="coaster-ring" aria-hidden="true" />
        )}
      </div>

      <span className="station-caption">Coaster · {cupStyle.name}</span>
    </section>
  );
}
