import { formatClock } from "../lib/format";
import type { MachineSnapshot } from "../types";

interface ClockStationProps {
  snapshot: MachineSnapshot;
  focusDurationMs: number;
  sessions: number;
}

const RING_RADIUS = 96;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function stateLabel(snapshot: MachineSnapshot): string {
  const { mode, phase } = snapshot;

  if (mode === "break") {
    if (phase === "running") return "Break time · café service";
    if (phase === "paused") return "Break paused";
    if (phase === "complete") return "Break complete";
    return "Break ready";
  }

  if (phase === "running") return "Focus in progress";
  if (phase === "paused") return "Focus paused";
  if (phase === "complete") return "Coffee is served";
  return "Focus ready";
}

export function ClockStation({
  snapshot,
  focusDurationMs,
  sessions,
}: ClockStationProps) {
  const isIdle = snapshot.phase === "idle";
  const displayMs = isIdle ? focusDurationMs : snapshot.remainingMs;
  const progress = isIdle ? 0 : snapshot.progress;
  const filledPips = sessions === 0 ? 0 : sessions % 4 === 0 ? 4 : sessions % 4;

  const ringTone =
    snapshot.phase === "paused"
      ? "paused"
      : snapshot.mode === "break"
        ? "break"
        : snapshot.phase === "complete"
          ? "complete"
          : snapshot.phase === "running"
            ? "focus"
            : "idle";

  return (
    <section
      className="clock-station"
      aria-label={`${snapshot.mode === "break" ? "Break" : "Focus"} timer`}
    >
      <div className="clock-bezel">
        <svg className="clock-ring" viewBox="0 0 200 200" aria-hidden="true">
          <circle
            className="clock-ring__track"
            cx="100"
            cy="100"
            r={RING_RADIUS}
          />
          <circle
            className={`clock-ring__progress clock-ring__progress--${ringTone}`}
            cx="100"
            cy="100"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
          />
        </svg>

        <div className="clock-face">
          <span className="clock-kicker">
            {snapshot.mode === "break" ? "Barista break clock" : "Desk focus clock"}
          </span>
          <span className="clock-time" role="timer" aria-live="off">
            {formatClock(displayMs)}
          </span>
          <span
            className={`clock-state clock-state--${snapshot.mode} clock-state--${snapshot.phase}`}
          >
            {stateLabel(snapshot)}
          </span>
        </div>

        <span className="clock-screw clock-screw--tl" aria-hidden="true" />
        <span className="clock-screw clock-screw--tr" aria-hidden="true" />
        <span className="clock-screw clock-screw--bl" aria-hidden="true" />
        <span className="clock-screw clock-screw--br" aria-hidden="true" />
      </div>

      <div className="clock-plinth" aria-hidden="true" />

      <div className="streak">
        <span className="streak-label">
          {sessions === 0
            ? "No cups brewed yet"
            : `${sessions} ${sessions === 1 ? "cup" : "cups"} brewed`}
        </span>
        <span
          className="streak-pips"
          role="img"
          aria-label={`${filledPips} of 4 pips filled in the current focus set`}
        >
          {[1, 2, 3, 4].map((pip) => (
            <span
              key={pip}
              className={`streak-pip${pip <= filledPips ? " is-filled" : ""}`}
            />
          ))}
        </span>
      </div>
    </section>
  );
}
