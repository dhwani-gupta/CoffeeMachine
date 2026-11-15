import { SIPS_PER_CUP } from "../data/cafe";
import type { Drink, MachineSnapshot } from "../types";

interface ServiceTickerProps {
  snapshot: MachineSnapshot;
  drink: Drink;
  serviceMessage: string;
  coffeeLevel: number;
}

function statusCopy(
  snapshot: MachineSnapshot,
  drink: Drink,
  serviceMessage: string,
): { label: string; message: string; tone: string } {
  const running = snapshot.phase === "running";
  const paused = snapshot.phase === "paused";

  if (snapshot.mode === "break") {
    if (running) {
      return {
        label: "Café service",
        message: serviceMessage,
        tone: "break",
      };
    }
    if (paused) {
      return {
        label: "Break held",
        message: "The counter is waiting. Resume whenever you are ready.",
        tone: "break",
      };
    }
    if (snapshot.phase === "complete") {
      return {
        label: "Cup cleared",
        message: "Break complete. The next focus is ready when you are.",
        tone: "muted",
      };
    }
    return {
      label: "Barista break",
      message: "The café will cover the counter while you step away.",
      tone: "break",
    };
  }

  if (running) {
    return {
      label: "Extraction",
      message: `${drink.bars.toFixed(1)} bar · ${snapshot.waterMl} ml · ${snapshot.beansG} g — ${drink.name.toLowerCase()} in progress`,
      tone: "focus",
    };
  }
  if (paused) {
    return {
      label: "Held",
      message: "The shot is held. Resume with Space whenever you are ready.",
      tone: "focus",
    };
  }
  if (snapshot.phase === "complete") {
    return {
      label: "Coffee served",
      message: `${drink.name} is waiting on the tray. Start your break and take your time.`,
      tone: "ready",
    };
  }
  return {
    label: "Counter ready",
    message: "Choose a mug on the wall, load it onto the machine, then start the focus.",
    tone: "idle",
  };
}

export function ServiceTicker({
  snapshot,
  drink,
  serviceMessage,
  coffeeLevel,
}: ServiceTickerProps) {
  const status = statusCopy(snapshot, drink, serviceMessage);
  const breakActive =
    snapshot.mode === "break" &&
    (snapshot.phase === "running" || snapshot.phase === "paused");
  const sipsLeft = Math.max(0, Math.ceil(coffeeLevel * SIPS_PER_CUP));

  return (
    <footer className={`service-bar service-bar--${status.tone}`}>
      <div className="service-bar__status">
        <span className={`service-bar__dot service-bar__dot--${status.tone}`} aria-hidden="true">
          <span />
        </span>
        <strong>{status.label}</strong>
        <span className="service-bar__message" aria-live="off">
          {status.message}
        </span>
      </div>

      <div className="service-bar__right">
        {breakActive ? (
          <span className="service-bar__sip" aria-label={`${sipsLeft} sips left`}>
            <span className="service-bar__sip-track" aria-hidden="true">
              <span style={{ width: `${Math.round(coffeeLevel * 100)}%` }} />
            </span>
            <span>{sipsLeft} {sipsLeft === 1 ? "sip" : "sips"} left</span>
          </span>
        ) : null}
        <span className="service-bar__keys">
          <kbd>Space</kbd> pause
          <kbd>S</kbd> sip
          <kbd>?</kbd> shortcuts
        </span>
      </div>
    </footer>
  );
}
