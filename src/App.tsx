import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { sound } from "./audio/AmbientSoundSystem";
import { ClockStation } from "./components/ClockStation";
import { CoasterStation } from "./components/CoasterStation";
import { CupRack } from "./components/CupRack";
import { EspressoMachine } from "./components/EspressoMachine";
import { ExitDialog } from "./components/ExitDialog";
import { HelpDialog } from "./components/HelpDialog";
import { OrderPad } from "./components/OrderPad";
import { TopBar } from "./components/TopBar";
import { WelcomeDialog } from "./components/WelcomeDialog";
import {
  BREAK_PRESETS,
  CUP_MAP,
  DEFAULT_BREAK_MS,
  DEFAULT_FOCUS_MS,
  DRINK_MAP,
  FOCUS_PRESETS,
  MAX_BREAK_MINUTES,
  MAX_FOCUS_MINUTES,
  MIN_BREAK_MINUTES,
  MIN_FOCUS_MINUTES,
  SERVICE_MESSAGES,
  SIP_SIZE,
} from "./data/cafe";
import type { DurationPreset } from "./data/cafe";
import { usePomodoroMachine } from "./hooks/usePomodoroMachine";
import { clamp, formatClock, formatDuration } from "./lib/format";
import { readStored, writeStored } from "./lib/storage";
import type {
  CupId,
  CupSpot,
  DrinkId,
  MachineSnapshot,
  Screen,
} from "./types";

const STORAGE = {
  drink: "cm.drink",
  duration: "cm.duration",
  preset: "cm.preset",
  customMinutes: "cm.customMinutes",
  breakDuration: "cm.breakDuration",
  breakPreset: "cm.breakPreset",
  breakCustomMinutes: "cm.breakCustomMinutes",
  cup: "cm.cup",
  sessions: "cm.sessions",
  muted: "cm.muted",
} as const;

const LEGACY_FOCUS_PRESETS: Record<string, string> = {
  pomodoro: "focus25",
  deep: "focus50",
  demo: "demo",
  custom: "custom",
};

function readDrinkId(): DrinkId {
  const stored = readStored<string>(STORAGE.drink, "cappuccino");
  return stored in DRINK_MAP ? (stored as DrinkId) : "cappuccino";
}

function readCupId(): CupId {
  const stored = readStored<string>(STORAGE.cup, "sage");
  return stored in CUP_MAP ? (stored as CupId) : "sage";
}

function readFocusDurationMs(): number {
  const stored = readStored<number>(STORAGE.duration, DEFAULT_FOCUS_MS);
  const maxMs = MAX_FOCUS_MINUTES * 60_000;
  return Number.isFinite(stored) && stored >= 5_000 && stored <= maxMs
    ? Math.round(stored)
    : DEFAULT_FOCUS_MS;
}

function readFocusPresetId(): string {
  const stored = readStored<string>(STORAGE.preset, "focus25");
  const normalized = LEGACY_FOCUS_PRESETS[stored] ?? stored;
  if (normalized === "custom") return normalized;
  return FOCUS_PRESETS.some((preset) => preset.id === normalized)
    ? normalized
    : "focus25";
}

function readFocusCustomInput(): string {
  const stored = readStored<number>(STORAGE.customMinutes, 30);
  const minutes = Number.isFinite(stored)
    ? clamp(Math.round(stored), MIN_FOCUS_MINUTES, MAX_FOCUS_MINUTES)
    : 30;
  return String(minutes);
}

function readBreakDurationMs(): number {
  const stored = readStored<number>(STORAGE.breakDuration, DEFAULT_BREAK_MS);
  const maxMs = MAX_BREAK_MINUTES * 60_000;
  return Number.isFinite(stored) && stored >= 5_000 && stored <= maxMs
    ? Math.round(stored)
    : DEFAULT_BREAK_MS;
}

function readBreakPresetId(): string {
  const stored = readStored<string>(STORAGE.breakPreset, "break5");
  if (stored === "custom") return stored;
  return BREAK_PRESETS.some((preset) => preset.id === stored)
    ? stored
    : "break5";
}

function readBreakCustomInput(): string {
  const stored = readStored<number>(STORAGE.breakCustomMinutes, 10);
  const minutes = Number.isFinite(stored)
    ? clamp(Math.round(stored), MIN_BREAK_MINUTES, MAX_BREAK_MINUTES)
    : 10;
  return String(minutes);
}

function readSessions(): number {
  const stored = readStored<number>(STORAGE.sessions, 0);
  return Number.isFinite(stored) && stored >= 0 ? Math.floor(stored) : 0;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [drinkId, setDrinkId] = useState<DrinkId>(readDrinkId);
  const [cupId, setCupId] = useState<CupId>(readCupId);
  const [focusDurationMs, setFocusDurationMs] = useState<number>(
    readFocusDurationMs,
  );
  const [focusPresetId, setFocusPresetId] = useState<string>(readFocusPresetId);
  const [focusCustomInput, setFocusCustomInput] =
    useState<string>(readFocusCustomInput);
  const [breakDurationMs, setBreakDurationMs] = useState<number>(
    readBreakDurationMs,
  );
  const [breakPresetId, setBreakPresetId] = useState<string>(readBreakPresetId);
  const [breakCustomInput, setBreakCustomInput] =
    useState<string>(readBreakCustomInput);
  const [sessions, setSessions] = useState<number>(readSessions);
  const [cupSpot, setCupSpot] = useState<CupSpot>("coaster");
  const [coffeeReady, setCoffeeReady] = useState(false);
  const [coffeeLevel, setCoffeeLevel] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [muted, setMuted] = useState<boolean>(() =>
    readStored<boolean>(STORAGE.muted, false),
  );
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const drink = DRINK_MAP[drinkId];
  const cupStyle = CUP_MAP[cupId];

  const handleComplete = useCallback((finished: MachineSnapshot) => {
    if (finished.mode === "focus") {
      setSessions((count) => count + 1);
      setCoffeeReady(true);
      setCoffeeLevel(1);
      setServiceIndex(0);
      sound.playLoudFinishSteam();
      return;
    }

    setCoffeeReady(false);
    setCoffeeLevel(0);
    sound.playBreakChime();
  }, []);

  const machine = usePomodoroMachine(handleComplete);
  const { snapshot } = machine;

  const busy = snapshot.phase === "running" || snapshot.phase === "paused";
  const focusBusy = snapshot.mode === "focus" && busy;
  const breakActive = snapshot.mode === "break" && busy;
  const focusComplete =
    snapshot.mode === "focus" && snapshot.phase === "complete";
  const breakComplete =
    snapshot.mode === "break" && snapshot.phase === "complete";
  const cupEditable = !busy && !coffeeReady;
  const drinkLocked = busy || coffeeReady;
  const focusLocked = busy || coffeeReady;
  const breakLocked = breakActive;
  const fill = coffeeReady
    ? coffeeLevel
    : snapshot.mode === "focus"
      ? snapshot.progress
      : 0;
  const serviceMessage =
    SERVICE_MESSAGES[serviceIndex % SERVICE_MESSAGES.length] ??
    SERVICE_MESSAGES[0];

  /* ---------------------------------------------------------------- persist */
  useEffect(() => writeStored(STORAGE.drink, drinkId), [drinkId]);
  useEffect(() => writeStored(STORAGE.cup, cupId), [cupId]);
  useEffect(() => writeStored(STORAGE.duration, focusDurationMs), [focusDurationMs]);
  useEffect(() => writeStored(STORAGE.preset, focusPresetId), [focusPresetId]);
  useEffect(
    () => writeStored(STORAGE.breakDuration, breakDurationMs),
    [breakDurationMs],
  );
  useEffect(() => writeStored(STORAGE.breakPreset, breakPresetId), [breakPresetId]);
  useEffect(() => writeStored(STORAGE.sessions, sessions), [sessions]);

  useEffect(() => {
    const parsed = Number.parseInt(focusCustomInput, 10);
    if (Number.isFinite(parsed)) {
      writeStored(STORAGE.customMinutes, parsed);
    }
  }, [focusCustomInput]);

  useEffect(() => {
    const parsed = Number.parseInt(breakCustomInput, 10);
    if (Number.isFinite(parsed)) {
      writeStored(STORAGE.breakCustomMinutes, parsed);
    }
  }, [breakCustomInput]);

  useEffect(() => {
    writeStored(STORAGE.muted, muted);
    sound.setMuted(muted);
  }, [muted]);

  /* ------------------------------------------------------------------ title */
  const timeLabel = formatClock(snapshot.remainingMs);
  useEffect(() => {
    if (snapshot.mode === "break") {
      document.title =
        snapshot.phase === "running" || snapshot.phase === "paused"
          ? `${timeLabel} · Break — Cozy Coffee`
          : "Break complete · Cozy Coffee";
      return;
    }

    if (snapshot.phase === "running" || snapshot.phase === "paused") {
      document.title = `${timeLabel} · ${drink.name} — Cozy Coffee`;
      return;
    }

    document.title = "Cozy Coffee · Pomodoro Focus Café";
  }, [snapshot.mode, snapshot.phase, timeLabel, drink.name]);

  /* -------------------------------------------------------- service messages */
  useEffect(() => {
    if (snapshot.mode !== "break" || snapshot.phase !== "running") return;

    const timer = window.setInterval(() => {
      setServiceIndex((index) => (index + 1) % SERVICE_MESSAGES.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [snapshot.mode, snapshot.phase]);

  /* --------------------------------------------------------------- handlers */
  const handleToggleMute = useCallback(() => {
    const next = !muted;
    sound.setMuted(next);
    setMuted(next);
    if (!next) sound.playClick();
  }, [muted]);

  const handleToggleMusic = useCallback(() => {
    setMusicPlaying(sound.toggleMusic());
  }, []);

  const handleStartBreak = useCallback(() => {
    if (snapshot.mode !== "focus" || snapshot.phase !== "complete") return;
    sound.playClick();
    setCupSpot("tray");
    setServiceIndex(0);
    machine.startBreak(breakDurationMs);
  }, [snapshot.mode, snapshot.phase, breakDurationMs, machine]);

  const handleSip = useCallback(() => {
    if (!coffeeReady || coffeeLevel <= 0) return;
    sound.playSip();
    setCoffeeLevel((level) =>
      Math.max(0, Math.round((level - SIP_SIZE) * 1000) / 1000),
    );
  }, [coffeeReady, coffeeLevel]);

  const handlePrimary = useCallback(() => {
    if (screen !== "desk") return;

    if (snapshot.phase === "running") {
      sound.playClick();
      machine.pause();
      return;
    }

    if (snapshot.phase === "paused") {
      sound.playClick();
      machine.resume();
      return;
    }

    if (snapshot.mode === "focus" && snapshot.phase === "complete") {
      sound.playClick();
      setCupSpot("tray");
      setServiceIndex(0);
      machine.startBreak(breakDurationMs);
      return;
    }

    if (cupSpot === "coaster") {
      sound.playPlaceCup();
      setCupSpot("tray");
      return;
    }

    sound.playClick();
    setCoffeeReady(false);
    setCoffeeLevel(0);
    setServiceIndex(0);
    machine.startFocus(drinkId, focusDurationMs);
  }, [
    screen,
    snapshot,
    cupSpot,
    breakDurationMs,
    drinkId,
    focusDurationMs,
    machine,
  ]);

  const handleStop = useCallback(() => {
    if (!busy) return;
    sound.playClick();
    machine.stop();
    setCoffeeReady(false);
    setCoffeeLevel(0);
  }, [busy, machine]);

  const handleCupActivate = useCallback(() => {
    if (coffeeReady && coffeeLevel > 0) {
      handleSip();
      return;
    }
    if (busy) return;

    sound.playPlaceCup();
    setCupSpot((spot) => (spot === "tray" ? "coaster" : "tray"));
  }, [coffeeReady, coffeeLevel, busy, handleSip]);

  const handleCupDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (busy) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("text/plain", "mug");
      event.dataTransfer.effectAllowed = "move";
    },
    [busy],
  );

  const handleDropOnTray = useCallback(() => {
    if (busy || cupSpot === "tray") return;
    sound.playPlaceCup();
    setCupSpot("tray");
  }, [busy, cupSpot]);

  const handleDropOnCoaster = useCallback(() => {
    if (busy || cupSpot === "coaster") return;
    sound.playPlaceCup();
    setCupSpot("coaster");
  }, [busy, cupSpot]);

  const handleSelectCup = useCallback(
    (nextCup: CupId) => {
      if (!cupEditable) return;
      sound.playPlaceCup();
      setCupId(nextCup);
    },
    [cupEditable],
  );

  const handleSelectDrink = useCallback(
    (nextDrink: DrinkId) => {
      if (drinkLocked) return;
      sound.playClick();
      setDrinkId(nextDrink);
    },
    [drinkLocked],
  );

  const handleSelectFocusPreset = useCallback(
    (preset: DurationPreset) => {
      if (focusLocked) return;
      sound.playClick();
      setFocusDurationMs(preset.ms);
      setFocusPresetId(preset.id);
    },
    [focusLocked],
  );

  const handleFocusCustomChange = useCallback((value: string) => {
    setFocusCustomInput(value.replace(/\D/g, "").slice(0, 3));
  }, []);

  const handleApplyFocusCustom = useCallback(() => {
    if (focusLocked) return;
    const parsed = Number.parseInt(focusCustomInput, 10);
    const minutes = clamp(
      Number.isFinite(parsed) ? parsed : 25,
      MIN_FOCUS_MINUTES,
      MAX_FOCUS_MINUTES,
    );
    setFocusCustomInput(String(minutes));
    setFocusDurationMs(minutes * 60_000);
    setFocusPresetId("custom");
    sound.playClick();
  }, [focusCustomInput, focusLocked]);

  const handleSelectBreakPreset = useCallback(
    (preset: DurationPreset) => {
      if (breakLocked) return;
      sound.playClick();
      setBreakDurationMs(preset.ms);
      setBreakPresetId(preset.id);
    },
    [breakLocked],
  );

  const handleBreakCustomChange = useCallback((value: string) => {
    setBreakCustomInput(value.replace(/\D/g, "").slice(0, 3));
  }, []);

  const handleApplyBreakCustom = useCallback(() => {
    if (breakLocked) return;
    const parsed = Number.parseInt(breakCustomInput, 10);
    const minutes = clamp(
      Number.isFinite(parsed) ? parsed : 5,
      MIN_BREAK_MINUTES,
      MAX_BREAK_MINUTES,
    );
    setBreakCustomInput(String(minutes));
    setBreakDurationMs(minutes * 60_000);
    setBreakPresetId("custom");
    sound.playClick();
  }, [breakCustomInput, breakLocked]);

  const handleExtendBreak = useCallback(() => {
    if (!breakActive) return;
    sound.playClick();
    machine.extend(5 * 60_000);
  }, [breakActive, machine]);

  const handleEnterCafe = useCallback(() => {
    sound.init();
    sound.playClick();
    setScreen("desk");
  }, []);

  const handleExit = useCallback(() => {
    sound.playClick();
    machine.reset();
    setCoffeeReady(false);
    setCoffeeLevel(0);
    setScreen("exit");
  }, [machine]);

  const handleReturn = useCallback(() => {
    sound.playClick();
    setScreen("welcome");
  }, []);

  const handleOpenHelp = useCallback(() => {
    sound.playClick();
    setHelpOpen(true);
  }, []);

  const handleCloseHelp = useCallback(() => setHelpOpen(false), []);

  /* -------------------------------------------------------------- keyboard */
  const primaryRef = useRef(handlePrimary);
  const sipRef = useRef(handleSip);
  useEffect(() => {
    primaryRef.current = handlePrimary;
  }, [handlePrimary]);
  useEffect(() => {
    sipRef.current = handleSip;
  }, [handleSip]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const typing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable === true;

      if (typing) return;
      if (event.defaultPrevented) return;

      if (event.key === "Escape") {
        setHelpOpen(false);
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setHelpOpen((open) => !open);
        return;
      }

      if (event.key.toLowerCase() === "m") {
        handleToggleMute();
        return;
      }

      if (event.key.toLowerCase() === "s" && screen === "desk" && !helpOpen) {
        event.preventDefault();
        sipRef.current();
        return;
      }

      if (event.code === "Space" && screen === "desk" && !helpOpen) {
        if (
          tag === "BUTTON" ||
          tag === "A" ||
          target?.closest('[role="button"]')
        ) {
          return;
        }
        event.preventDefault();
        primaryRef.current();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen, helpOpen, handleToggleMute]);

  const stopLabel =
    snapshot.mode === "break" && busy ? "End break" : "Stop focus";

  return (
    <div className="app-shell" data-screen={screen}>
      <TopBar
        sessions={sessions}
        muted={muted}
        musicPlaying={musicPlaying}
        onToggleMute={handleToggleMute}
        onToggleMusic={handleToggleMusic}
        onOpenHelp={handleOpenHelp}
      />

      <main className="scene">
        <div className="wall-zone">
          <CupRack
            selectedCupId={cupId}
            disabled={!cupEditable}
            onSelect={handleSelectCup}
          />
        </div>

        <div className="table">
          <div className="tabletop">
            <ClockStation
              snapshot={snapshot}
              focusDurationMs={focusDurationMs}
              sessions={sessions}
            />

            <EspressoMachine
              snapshot={snapshot}
              drink={drink}
              cupStyle={cupStyle}
              coffeeReady={coffeeReady}
              fill={fill}
              serviceMessage={serviceMessage}
              cupSpot={cupSpot}
              cupLocked={busy}
              cupDisabled={focusBusy}
              onCupActivate={handleCupActivate}
              onCupDragStart={handleCupDragStart}
              onTrayDrop={handleDropOnTray}
            />

            <OrderPad
              snapshot={snapshot}
              drink={drink}
              cupStyle={cupStyle}
              focusDurationMs={focusDurationMs}
              focusPresetId={focusPresetId}
              focusCustomInput={focusCustomInput}
              focusLocked={focusLocked}
              breakDurationMs={breakDurationMs}
              breakPresetId={breakPresetId}
              breakCustomInput={breakCustomInput}
              breakLocked={breakLocked}
              drinkLocked={drinkLocked}
              cupSpot={cupSpot}
              coffeeLevel={coffeeLevel}
              serviceMessage={serviceMessage}
              stopLabel={stopLabel}
              stopDisabled={!busy}
              onSelectDrink={handleSelectDrink}
              onSelectFocusPreset={handleSelectFocusPreset}
              onFocusCustomChange={handleFocusCustomChange}
              onApplyFocusCustom={handleApplyFocusCustom}
              onSelectBreakPreset={handleSelectBreakPreset}
              onBreakCustomChange={handleBreakCustomChange}
              onApplyBreakCustom={handleApplyBreakCustom}
              onPrimary={handlePrimary}
              onStop={handleStop}
              onSip={handleSip}
              onExtendBreak={handleExtendBreak}
            />

            <CoasterStation
              drink={drink}
              cupStyle={cupStyle}
              snapshot={snapshot}
              cupSpot={cupSpot}
              fill={fill}
              locked={busy}
              disabled={focusBusy}
              coffeeReady={coffeeReady}
              onCupActivate={handleCupActivate}
              onCupDragStart={handleCupDragStart}
              onDropCup={handleDropOnCoaster}
            />
          </div>

          <div className="table-apron" aria-hidden="true">
            <span className="table-apron__edge" />
            <span className="table-apron__leg table-apron__leg--left" />
            <span className="table-apron__leg table-apron__leg--right" />
          </div>
        </div>
      </main>

      <footer className="hints-bar">
        <span className="hint">
          <kbd>Space</kbd> start / pause
        </span>
        <span className="hint">
          <kbd>S</kbd> sip
        </span>
        <span className="hint">
          <kbd>M</kbd> mute
        </span>
        <span className="hint">
          <kbd>?</kbd> shortcuts
        </span>
        <span className="hint hint--soft">
          Tap a wall cup to choose it — sip during break
        </span>
      </footer>

      {focusComplete && coffeeReady && screen === "desk" ? (
        <div className="ready-toast ready-toast--coffee" role="status" aria-live="polite">
          <span className="ready-toast__dot" aria-hidden="true" />
          <p>
            <strong>Your {drink.name} is served.</strong> Start your{" "}
            {formatDuration(breakDurationMs)} break — the café is covered.
          </p>
          <div className="toast-actions">
            <button
              type="button"
              className="btn btn--small"
              onClick={handleStartBreak}
            >
              Start break
            </button>
            {coffeeLevel > 0 ? (
              <button
                type="button"
                className="toast-ghost"
                onClick={handleSip}
              >
                Sip
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {breakComplete && screen === "desk" ? (
        <div className="ready-toast ready-toast--break" role="status" aria-live="polite">
          <span className="ready-toast__dot" aria-hidden="true" />
          <p>
            <strong>Break complete.</strong> The cup is cleared — ready for
            another focus?
          </p>
          <button type="button" className="btn btn--small" onClick={handlePrimary}>
            Start focus · {formatDuration(focusDurationMs)}
          </button>
        </div>
      ) : null}

      {screen === "welcome" ? (
        <WelcomeDialog onEnter={handleEnterCafe} onExit={handleExit} />
      ) : null}

      {screen === "exit" ? <ExitDialog onReturn={handleReturn} /> : null}

      {helpOpen ? <HelpDialog onClose={handleCloseHelp} /> : null}
    </div>
  );
}
