import {
  BREAK_PRESETS,
  DRINKS,
  FOCUS_PRESETS,
  MAX_BREAK_MINUTES,
  MAX_FOCUS_MINUTES,
  MIN_BREAK_MINUTES,
  MIN_FOCUS_MINUTES,
  SIPS_PER_CUP,
} from "../data/cafe";
import type { DurationPreset } from "../data/cafe";
import { formatClock, formatDuration } from "../lib/format";
import type {
  CupSpot,
  CupStyle,
  Drink,
  DrinkId,
  MachineSnapshot,
} from "../types";
import { IconCup, IconPause, IconPlay, IconStop } from "./icons";

interface OrderPadProps {
  snapshot: MachineSnapshot;
  drink: Drink;
  cupStyle: CupStyle;
  focusDurationMs: number;
  focusPresetId: string;
  focusCustomInput: string;
  focusLocked: boolean;
  breakDurationMs: number;
  breakPresetId: string;
  breakCustomInput: string;
  breakLocked: boolean;
  drinkLocked: boolean;
  cupSpot: CupSpot;
  coffeeLevel: number;
  serviceMessage: string;
  stopLabel: string;
  stopDisabled: boolean;
  onSelectDrink: (drinkId: DrinkId) => void;
  onSelectFocusPreset: (preset: DurationPreset) => void;
  onFocusCustomChange: (value: string) => void;
  onApplyFocusCustom: () => void;
  onSelectBreakPreset: (preset: DurationPreset) => void;
  onBreakCustomChange: (value: string) => void;
  onApplyBreakCustom: () => void;
  onPrimary: () => void;
  onStop: () => void;
  onSip: () => void;
  onExtendBreak: () => void;
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
    <div className="custom-row">
      <label className="custom-label" htmlFor={id}>
        Custom
      </label>
      <div className="custom-field" title={`${min}–${max} minutes`}>
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
        className={`custom-apply${active ? " is-active" : ""}`}
        onClick={onApply}
        disabled={disabled}
      >
        Set
      </button>
    </div>
  );
}

export function OrderPad({
  snapshot,
  drink,
  cupStyle,
  focusDurationMs,
  focusPresetId,
  focusCustomInput,
  focusLocked,
  breakDurationMs,
  breakPresetId,
  breakCustomInput,
  breakLocked,
  drinkLocked,
  cupSpot,
  coffeeLevel,
  serviceMessage,
  stopLabel,
  stopDisabled,
  onSelectDrink,
  onSelectFocusPreset,
  onFocusCustomChange,
  onApplyFocusCustom,
  onSelectBreakPreset,
  onBreakCustomChange,
  onApplyBreakCustom,
  onPrimary,
  onStop,
  onSip,
  onExtendBreak,
}: OrderPadProps) {
  const isBreak = snapshot.mode === "break";
  const breakActive =
    isBreak &&
    (snapshot.phase === "running" || snapshot.phase === "paused");
  const focusComplete =
    snapshot.mode === "focus" && snapshot.phase === "complete";
  const breakComplete = isBreak && snapshot.phase === "complete";
  const paused = snapshot.phase === "paused";
  const sipsLeft = Math.max(0, Math.ceil(coffeeLevel * SIPS_PER_CUP));

  const primaryIcon =
    snapshot.phase === "running" ? (
      <IconPause width={15} height={15} />
    ) : snapshot.phase === "paused" ? (
      <IconPlay width={15} height={15} />
    ) : focusComplete ? (
      <IconCup width={15} height={15} />
    ) : (
      <IconPlay width={15} height={15} />
    );

  const primaryLabel =
    snapshot.phase === "running"
      ? isBreak
        ? "Pause break"
        : "Pause focus"
      : snapshot.phase === "paused"
        ? isBreak
          ? "Resume break"
          : "Resume focus"
        : focusComplete
          ? `Start break · ${formatDuration(breakDurationMs)}`
          : cupSpot === "coaster"
            ? "Load the mug"
            : `Start focus · ${formatDuration(focusDurationMs)}`;

  return (
    <aside className="order-pad" aria-label="Barista order pad">
      <span className="order-pad__clip" aria-hidden="true" />

      <div className="pad-head">
        <span className="pad-eyebrow">Order ticket</span>
        <span className={`pad-mode pad-mode--${snapshot.mode}`}>
          {isBreak ? (breakComplete ? "Break done" : "Break") : "Focus"}
        </span>
      </div>

      <div className="pad-order">
        <span className="pad-order__name">{drink.name}</span>
        <span className="pad-order__meta">
          {drink.note} · {cupStyle.name.toLowerCase()} cup
        </span>
      </div>

      {breakActive ? (
        <>
          <div className={`service-ticket${paused ? " is-paused" : ""}`}>
          <div className="service-ticket__head">
            <span className="service-led" aria-hidden="true" />
            <span>Café service</span>
            <span className="service-ticket__time">
              {formatClock(snapshot.remainingMs)}
            </span>
          </div>

          <p className="service-ticket__message" key={serviceMessage}>
            {coffeeLevel <= 0
              ? "Cup finished. Enjoy the rest of the break."
              : paused
                ? "Break paused — the counter can wait."
                : serviceMessage}
          </p>

          <div className="sip-meter">
            <div className="sip-meter__track" aria-hidden="true">
              <span style={{ width: `${Math.round(coffeeLevel * 100)}%` }} />
            </div>
            <span className="sip-meter__label">
              {sipsLeft} {sipsLeft === 1 ? "sip" : "sips"} left
            </span>
          </div>

          <div className="service-actions">
            <button
              type="button"
              className="sip-button"
              onClick={onSip}
              disabled={coffeeLevel <= 0}
            >
              <IconCup width={14} height={14} />
              Take a sip
            </button>
            <button
              type="button"
              className="extend-button"
              onClick={onExtendBreak}
              title="Add five minutes to this break"
            >
              +5 min
            </button>
          </div>

          <p className="service-ticket__note">
            {paused
              ? "The café is on hold. Resume when you're ready."
              : "The café is covered — sip slowly."}
          </p>
        </div>

        <div className="break-ritual">
          <span className="break-ritual__label">Break ritual</span>
          <ul>
            <li>Sip slowly — there is no rush.</li>
            <li>Roll your shoulders out.</li>
            <li>Watch the café for a minute.</li>
          </ul>
          <p className="break-ritual__next">
            Next focus · {formatDuration(focusDurationMs)}
          </p>
        </div>
        </>
      ) : (
        <>
          <section className="pad-section">
            <span className="pad-label">Choose your roast</span>
            <div className="pad-grid pad-grid--2">
              {DRINKS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`pad-chip pad-chip--roast${
                    option.id === drink.id ? " is-active" : ""
                  }`}
                  onClick={() => onSelectDrink(option.id)}
                  disabled={drinkLocked}
                  aria-pressed={option.id === drink.id}
                  title={`${option.name} · ${option.note}`}
                >
                  <span className="pad-chip__label">{option.name}</span>
                  <span className="pad-chip__hint">{option.note}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="pad-section">
            <div className="pad-label-row">
              <span className="pad-label">Focus length</span>
              <span className="pad-meta">{formatDuration(focusDurationMs)}</span>
            </div>
            <div className="pad-grid pad-grid--3">
              {FOCUS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`pad-chip pad-chip--time${
                    focusPresetId === preset.id ? " is-active" : ""
                  }`}
                  onClick={() => onSelectFocusPreset(preset)}
                  disabled={focusLocked}
                  aria-pressed={focusPresetId === preset.id}
                  title={`${preset.label} · ${preset.hint}`}
                >
                  <span className="pad-chip__label">{preset.label}</span>
                  <span className="pad-chip__hint">{preset.hint}</span>
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

          {focusComplete ? (
            <div className="reward-note">
              <span className="reward-note__dot" aria-hidden="true" />
              <div>
                <strong>Your coffee is served.</strong>
                <p>
                  Start the break, then sip whenever you like.{" "}
                  {sipsLeft > 0
                    ? `${sipsLeft} ${sipsLeft === 1 ? "sip" : "sips"} left.`
                    : "Cup empty."}
                </p>
              </div>
            </div>
          ) : null}

          <section className="pad-section">
            <div className="pad-label-row">
              <span className="pad-label">Break length</span>
              <span className="pad-meta">{formatDuration(breakDurationMs)}</span>
            </div>
            <div className="pad-grid pad-grid--4">
              {BREAK_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`pad-chip pad-chip--time pad-chip--compact${
                    breakPresetId === preset.id ? " is-active" : ""
                  }`}
                  onClick={() => onSelectBreakPreset(preset)}
                  disabled={breakLocked}
                  aria-pressed={breakPresetId === preset.id}
                  title={`${preset.label} · ${preset.hint}`}
                >
                  <span className="pad-chip__label">{preset.label}</span>
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

          {breakComplete ? (
            <div className="break-done-note">
              Break complete. Cup cleared — ready for another focus.
            </div>
          ) : null}
        </>
      )}

      <div className="pad-actions">
        <button
          type="button"
          className={`pad-primary${isBreak ? " is-break" : ""}${
            snapshot.phase === "running" ? " is-pause" : ""
          }`}
          onClick={onPrimary}
        >
          {primaryIcon}
          {primaryLabel}
        </button>
        <button
          type="button"
          className="pad-stop"
          onClick={onStop}
          disabled={stopDisabled}
          title={isBreak ? "Finish the break early" : "Stop this focus session"}
        >
          <IconStop width={11} height={11} />
          {stopLabel}
        </button>
      </div>
    </aside>
  );
}
