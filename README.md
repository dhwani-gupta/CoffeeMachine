# ☕ Cozy Coffee — Pomodoro Focus Café

A pomodoro timer disguised as a cozy espresso machine. Pick a roast, load the
mug, and let your focus brew in gentle steam pulses. Converted from the original
single-file `index.html` build to **React + Vite + TypeScript**, with a refreshed
UI and a few quality-of-life upgrades.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

Production build:

```bash
npm run build     # type-check + bundle into dist/
npm run preview   # serve the production build
```

## What's new compared to the original page

**Architecture**

- React 19 function components with TypeScript in strict mode.
- Vite 8 for dev server and production builds.
- The brewing logic still lives in an object-oriented domain model
  (`PomodoroEspressoMachine` / abstract `BaseBrewingAppliance`) and is bridged
  to React through the `usePomodoroMachine` hook.
- Styles split into tokens/reset, scene, machine, overlays and responsive files.
- Audio synthesis extracted into a typed `AmbientSoundSystem` singleton.

**UI**

- Rebuilt desk scene with a wooden surface, warm lighting, premium machine
  styling, a physical pressure gauge and an oversized ceramic mug.
- Round desk clock with a live progress ring, session streak pips and clear
  timer states.
- Responsive layout that stacks cleanly on tablets and phones.
- Favicon, theme colour, page metadata and a proper document title that shows
  the running timer.
- Toast notification with a direct **Sip & reset** action when a drink is ready.
- Persisted preferences (roast, duration, session count, mute) via
  `localStorage`.

**UX**

- Load the mug by dragging **or tapping** it (touch-friendly), or press the
  primary button.
- Pause and resume a session instead of only stopping it.
- Custom session length from 1–120 minutes.
- Live session summary under the desk, larger hit areas and visible focus
  states for keyboard users.
- Keyboard shortcuts: `Space` (start/pause/resume), `M` (mute), `?` (help),
  `Esc` (close dialogs).
- Accessible dialogs with focus trapping, `aria-live` machine status and
  reduced-motion support.
- Deadline-based timer (no drift if the tab is throttled or backgrounded).
- Global mute and lo-fi ambience are independent, with sound synthesised
  entirely in the browser — no audio assets required.

## Project structure

```
index.html                        Vite entry
src/
  main.tsx                        React root
  App.tsx                         Screen flow + application state
  types.ts                        Shared domain types
  audio/
    AmbientSoundSystem.ts         Web Audio synthesis (clicks, steam, lo-fi)
  data/
    drinks.ts                     Roasts + duration presets
  domain/
    PomodoroEspressoMachine.ts    Brewing engine + abstract base class
  hooks/
    usePomodoroMachine.ts         React bridge for the machine
  components/
    TopBar.tsx
    ClockStation.tsx
    CoffeeMachine.tsx
    Cup.tsx
    CoasterStation.tsx
    Modal.tsx
    WelcomeDialog.tsx
    ExitDialog.tsx
    HelpDialog.tsx
    icons.tsx
  lib/
    format.ts                     Time formatting / clamping
    storage.ts                    Safe localStorage helpers
  styles/
    base.css, scene.css, machine.css, overlays.css, responsive.css
legacy/
  pomodoro-original.html          Original single-file implementation
```

The other existing HTML experiments (`cozy_office_coffee_maker.html`,
`pomodoroCoffeeMachine.html`) were left untouched.

## Notes

- Audio starts on the first user gesture, as required by browser autoplay
  policies.
- The ready toast stays visible until you take a sip (or use the reset action).
- Preferences are device-local; clearing site data resets them.
