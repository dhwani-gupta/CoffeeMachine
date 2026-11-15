import {
  BREAK_PRESETS,
  CUP_STYLES,
  DRINKS,
  FOCUS_PRESETS,
  MAX_BREAK_MINUTES,
  MAX_FOCUS_MINUTES,
  MIN_BREAK_MINUTES,
  MIN_FOCUS_MINUTES,
} from "../data/cafe";
import type { DurationPreset } from "../data/cafe";
import { formatDuration } from "../lib/format";
import type {
  CupId,
  CupStyle,
  Drink,
  DrinkId,
  MachineSnapshot,
} from "../types";
import { IconClose } from "./icons";

interface OrderTicketProps {
  snapshot: MachineSnapshot;
  drink: Drink;
  cupStyle: CupStyle;
  cupId: CupId;
  focusDurationMs: number;
  focusPresetId: string;
  focusCustomInput: string;
  focusLocked: boolean;
  breakDurationMs: number;
  breakPresetId: string;
  breakCustomInput: string;
  breakLocked: boolean;
  drinkLocked: boolean;
  cupLocked: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelectDrink: (drinkId: DrinkId) => void;
  onSelectCup: (cupId: CupId) => void;
  onSelectFocusPreset: (preset: DurationPreset) => void;
  onFocusCustomChange: (value: string) => void;
  onApplyFocusCustom: () => void;
  onSelectBreakPreset: (preset: DurationPreset) => void;
  onBreakCustomChange: (value: string) => void;
  onApplyBreakCustom: () => void;
}

interface CustomDurationProps {
  id: string;
  value: string;
  active: boolean;
  disabled: boolean;
  min: number;
  max: number;
  onChange: (value: string) => void;
  onApply: () => void;
  label: string;
}

function CustomDuration({
  id,
  value,
  active,
  disabled,
  min,
  max,
  onChange,
  onApply,
  label,
}: CustomDurationProps) {
  return (
    <div className="ticket-custom">
      <label className="ticket-custom__label" htmlFor={id}>
        Custom
      </label>
      <div className="ticket-custom__field" title={`${min}–${max} minutes`}>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onApply();
          }}
          disabled={disabled}
          aria-label={`${label} custom length in minutes`}
        />
        <span aria-hidden="true">min</span>
      </div>
      <button
        type="button"
        className={`ticket-custom__apply${active ? " is-active" : ""}`}
        onClick={onApply}
        disabled={disabled}
      >
        Set
      </button>
    </div>
  );
}

export function OrderTicket({
  snapshot,
  drink,
  cupStyle,
  cupId,
  focusDurationMs,
  focusPresetId,
  focusCustomInput,
  focusLocked,
  breakDurationMs,
  breakPresetId,
  breakCustomInput,
  breakLocked,
  drinkLocked,
  cupLocked,
  isOpen,
  onClose,
  onSelectDrink,
  onSelectCup,
  onSelectFocusPreset,
  onFocusCustomChange,
  onApplyFocusCustom,
  onSelectBreakPreset,
  onBreakCustomChange,
  onApplyBreakCustom,
}: OrderTicketProps) {
  const focusComplete =
    snapshot.mode === "focus" && snapshot.phase === "complete";
  const breakComplete =
    snapshot.mode === "break" && snapshot.phase === "complete";
  const running = snapshot.phase === "running" || snapshot.phase === "paused";

  return (
    <aside
      className={`order-ticket${isOpen ? " is-open" : ""}`}
      aria-label="Order settings"
    >
      <span className="order-ticket__clip" aria-hidden="true" />
      <button
        type="button"
        className="order-ticket__close"
        onClick={onClose}
        aria-label="Close order settings"
      >
        <IconClose width={17} height={17} />
      </button>

      <header className="ticket-head">
        <div>
          <span className="ticket-eyebrow">Order ticket</span>
          <span className="ticket-number">No. 024 · Table 04</span>
        </div>
        <span
          className={`ticket-mode ticket-mode--${snapshot.mode}${
            running ? " is-running" : ""
          }`}
        >
          {snapshot.mode === "break"
            ? breakComplete
              ? "Break done"
              : running
                ? "On break"
                : "Break"
            : running
              ? "In session"
              : focusComplete
                ? "Served"
                : "Ready"}
        </span>
      </header>

      <div className="ticket-order">
        <div>
          <h2>{drink.name}</h2>
          <p>
            {drink.note} · {cupStyle.name.toLowerCase()} mug
          </p>
        </div>
        <span className="ticket-order__stamp" aria-hidden="true">
          {drink.bars} bar
        </span>
      </div>

      <section className="ticket-section">
        <span className="ticket-label">The pour</span>
        <div className="ticket-grid ticket-grid--2">
          {DRINKS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`drink-choice${option.id === drink.id ? " is-active" : ""}`}
              onClick={() => onSelectDrink(option.id)}
              disabled={drinkLocked}
              aria-pressed={option.id === drink.id}
              title={`${option.name} · ${option.note}`}
            >
              <span
                className="drink-choice__dot"
                style={{ backgroundColor: option.crema }}
                aria-hidden="true"
              />
              <span className="drink-choice__copy">
                <span className="drink-choice__name">{option.name}</span>
                <span className="drink-choice__note">{option.note}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="ticket-section">
        <div className="ticket-label-row">
          <span className="ticket-label">Your mug</span>
          <span className="ticket-value">{cupStyle.name}</span>
        </div>
        <div className="cup-choice-row">
          {CUP_STYLES.map((cup) => (
            <button
              key={cup.id}
              type="button"
              className={`cup-choice${cup.id === cupId ? " is-active" : ""}`}
              onClick={() => onSelectCup(cup.id)}
              disabled={cupLocked}
              aria-pressed={cup.id === cupId}
              aria-label={`${cup.name} mug`}
              title={`${cup.name} mug`}
            >
              <span
                className="cup-choice__swatch"
                style={{
                  background: `linear-gradient(145deg, ${cup.light} 0%, ${cup.light} 45%, ${cup.dark} 100%)`,
                  boxShadow: `inset 0 -4px 8px ${cup.dark}66`,
                }}
                aria-hidden="true"
              />
              <span className="cup-choice__handle" style={{ borderColor: cup.handle }} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <section className="ticket-section">
        <div className="ticket-label-row">
          <span className="ticket-label">Focus</span>
          <span className="ticket-value">{formatDuration(focusDurationMs)}</span>
        </div>
        <div className="ticket-grid ticket-grid--3">
          {FOCUS_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`time-choice${focusPresetId === preset.id ? " is-active" : ""}`}
              onClick={() => onSelectFocusPreset(preset)}
              disabled={focusLocked}
              aria-pressed={focusPresetId === preset.id}
              title={`${preset.label} · ${preset.hint}`}
            >
              <span>{preset.label}</span>
              <em>{preset.hint}</em>
            </button>
          ))}
        </div>
        <CustomDuration
          id="focus-custom"
          label="Focus"
          value={focusCustomInput}
          active={focusPresetId === "custom"}
          disabled={focusLocked}
          min={MIN_FOCUS_MINUTES}
          max={MAX_FOCUS_MINUTES}
          onChange={onFocusCustomChange}
          onApply={onApplyFocusCustom}
        />
      </section>

      <section className="ticket-section">
        <div className="ticket-label-row">
          <span className="ticket-label">Break</span>
          <span className="ticket-value">{formatDuration(breakDurationMs)}</span>
        </div>
        <div className="ticket-grid ticket-grid--4">
          {BREAK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`time-choice time-choice--compact${
                breakPresetId === preset.id ? " is-active" : ""
              }`}
              onClick={() => onSelectBreakPreset(preset)}
              disabled={breakLocked}
              aria-pressed={breakPresetId === preset.id}
              title={`${preset.label} · ${preset.hint}`}
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
        <CustomDuration
          id="break-custom"
          label="Break"
          value={breakCustomInput}
          active={breakPresetId === "custom"}
          disabled={breakLocked}
          min={MIN_BREAK_MINUTES}
          max={MAX_BREAK_MINUTES}
          onChange={onBreakCustomChange}
          onApply={onApplyBreakCustom}
        />
      </section>

      {focusComplete ? (
        <div className="ticket-note ticket-note--ready">
          <span aria-hidden="true">●</span>
          <p>
            <strong>Coffee is served.</strong> Use the clock card to start the
            break; sip whenever you like.
          </p>
        </div>
      ) : null}

      {breakComplete ? (
        <div className="ticket-note">
          <span aria-hidden="true">●</span>
          <p>Break complete. The cup is cleared and the counter is ready.</p>
        </div>
      ) : null}

      <footer className="ticket-footer">
        <span>Changes lock while the timer runs.</span>
        <span>— your barista</span>
      </footer>
    </aside>
  );
}
