# ☕ Cozy Coffee — Barista Pomodoro Café

A pomodoro timer disguised as a tiny barista's corner. Choose a glazed cup from
the wall, set a focus session, and let a commercial espresso machine pull your
reward in steam pulses. When the focus ends, the coffee is served — start your
break and sip it slowly while the café-service messages roll in.

Built with **React 19 + Vite + TypeScript**, converted from the original
single-file `index.html` build and kept dependency-light: every visual is
handcrafted CSS and every sound is synthesised with the Web Audio API.

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

## The ritual

1. **Pick a cup.** Six glazes sit on the wooden wall rack above the machine.
   The cup is yours for the session; it appears on the machine tray or coaster.
2. **Set focus and break.** Use the presets or enter custom minutes on the order
   pad. Focus defaults to 25 minutes, break to 5.
3. **Focus.** Load the mug and start. The machine brews while the clock ring
   fills; the LCD and pressure gauge keep you company.
4. **Coffee is served.** Focus completion serves the drink — it does **not**
   auto-start the break. Start the break from the order pad or the toast.
5. **Take your break.** Sip from the cup during the break. Each sip lowers the
   coffee by 20% (five sips empty the cup). The LCD and order pad show café
   service messages — serving other customers, steaming oat milk, wiping the
   counter, and so on.
6. **Back to it.** The break ends, the cup is cleared, and the next focus is
   ready. The session count increments once per completed focus.

## Features

**The scene**

- Wooden café table with a barista's order pad, coaster, desk clock and a
  stainless commercial espresso machine (group head, portafilter, steam and
  hot-water wands, pressure gauge, LCD and drip tray).
- Wall-mounted cup rack with six ceramic glazes: porcelain, sage, terracotta,
  cobalt, honey and rose.
- The selected cup is visible on the tray or coaster and is fully sip-able
  during breaks.

**Focus and break modes**

- Separate `focus` and `break` timer modes in the domain model and UI.
- Focus presets: 25 min, 50 min, 10 sec preview. Custom focus: 1–120 minutes.
- Break presets: 5 min, 10 min, 15 min, 10 sec preview. Custom break: 1–30
  minutes.
- Break length is configured independently and can be changed while focusing.
- Break can be paused/resumed, extended by five minutes mid-break, or ended
  early.
- Starting a break is only valid after a focus completes; starting focus is
  valid from idle or after a break completes.

**Coffee reward**

- Focus completion serves the drink at full level and increments the session
  count.
- Sips are allowed both at focus-complete and during the break. Each sip takes
  20% of the cup and plays a tiny ceramic sip sound.
- Cup changes lock while a session is running/paused or coffee is served;
  session control remains available.
- Break completion (or ending the break/focus early) clears the coffee and the
  cup level.

**Controls and polish**

- Load or return the mug by dragging **or tapping** it.
- Keyboard shortcuts: `Space` (start/pause/resume), `S` (sip when coffee is
  served), `M` (mute), `?` (help), `Esc` (close dialogs).
- Toast actions for starting the break, taking a sip, or beginning the next
  focus.
- Persisted preferences and session count via `localStorage` (`cm.*` keys).
- Document title reflects the running focus/break state.
- Deadline-based timer (no drift while the tab is throttled or backgrounded).
- Global mute and lo-fi ambience are independent; sounds are generated in the
  browser with no audio files.
- Accessible dialogs with focus trapping, `aria-live` machine status, visible
  keyboard focus, and reduced-motion support.
- Responsive three-column tabletop that becomes a centred single-column scene
  on tablets and phones.

## Architecture

- React function components with TypeScript.
- Brewing/break logic lives in the object-oriented `PomodoroEspressoMachine`
  built on the abstract `BaseBrewingAppliance`, bridged to React through
  `usePomodoroMachine`.
- Timer state is mode-aware (`focus` / `break`, `idle` / `running` / `paused` /
  `complete`) and snapshot-driven.
- Data tables for drinks, cup styles, presets, sip constants and service
  messages live in `src/data/cafe.ts`.
- CSS is split into tokens/reset, scene, machine + order pad, overlays and
  responsive files.
- Web Audio synthesis is encapsulated in `AmbientSoundSystem`.

## Project structure

```text
index.html                        Vite entry
src/
  main.tsx                        React root
  App.tsx                         Screen flow, focus/break/cup/coffee state
  types.ts                        Shared domain types
  audio/
    AmbientSoundSystem.ts         Clicks, steam, sip, break chime, lo-fi
  data/
    cafe.ts                       Drinks, cup glazes, presets, service messages
  domain/
    PomodoroEspressoMachine.ts    Focus/break engine + abstract base class
  hooks/
    usePomodoroMachine.ts         React bridge for the machine
  components/
    TopBar.tsx
    ClockStation.tsx              Desk clock, progress ring, session pips
    CupRack.tsx                   Wall-mounted cup selector
    EspressoMachine.tsx           Commercial machine + brew deck
    Cup.tsx                       Ceramic cup, liquid level, steam, sips
    CoasterStation.tsx            Coaster + cup drop target
    OrderPad.tsx                  Drinks, focus/break config, service ticket
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
  pomodoro-original.html          Preserved original single-file version
```

The other HTML experiments (`cozy_office_coffee_maker.html`,
`pomodoroCoffeeMachine.html`) were left untouched.

## Notes

- Audio starts on the first user gesture, as required by browser autoplay
  policies.
- The coffee-served toast stays until you start the break or take a sip; the
  break-complete toast stays until the next focus starts.
- Custom duration inputs apply on **Enter** or the **Set** button and are
  clamped to the allowed range.
- Preferences and the session count are device-local; clearing site data resets
  them.
