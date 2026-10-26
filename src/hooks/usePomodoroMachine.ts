import { useEffect, useMemo, useRef, useState } from "react";
import {
  INITIAL_MACHINE_SNAPSHOT,
  PomodoroEspressoMachine,
} from "../domain/PomodoroEspressoMachine";
import type { DrinkId, MachineSnapshot } from "../types";

export interface PomodoroMachineApi {
  snapshot: MachineSnapshot;
  startFocus: (drinkId: DrinkId, durationMs: number) => boolean;
  startBreak: (durationMs: number) => boolean;
  pause: () => boolean;
  resume: () => boolean;
  stop: () => boolean;
  reset: () => void;
  extend: (extraMs: number) => boolean;
}

/**
 * Bridges the imperative machine with React state. The machine remains the
 * single source of truth for the session; every tick is mirrored into a snapshot.
 */
export function usePomodoroMachine(
  onComplete?: (snapshot: MachineSnapshot) => void,
): PomodoroMachineApi {
  const [snapshot, setSnapshot] = useState<MachineSnapshot>(
    INITIAL_MACHINE_SNAPSHOT,
  );

  const completeRef = useRef(onComplete);
  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  const machineRef = useRef<PomodoroEspressoMachine | null>(null);
  if (machineRef.current === null) {
    machineRef.current = new PomodoroEspressoMachine({
      onUpdate: setSnapshot,
      onComplete: (finished) => completeRef.current?.(finished),
    });
  }
  const machine = machineRef.current;

  useEffect(() => () => machine.dispose(), [machine]);

  return useMemo(
    () => ({
      snapshot,
      startFocus: (drinkId, durationMs) =>
        machine.startFocusSession(drinkId, durationMs),
      startBreak: (durationMs) => machine.startBreakSession(durationMs),
      pause: () => machine.pauseSession(),
      resume: () => machine.resumeSession(),
      stop: () => machine.stopSession(),
      reset: () => machine.resetSession(),
      extend: (extraMs) => machine.extendSession(extraMs),
    }),
    [machine, snapshot],
  );
}
