# ☕ Cozy Coffee — Barista Pomodoro Café

A pomodoro timer disguised as a tiny barista's corner. Choose a glazed cup from
the wall, set a focus session, and let a commercial espresso machine pull your
reward in steam pulses. When the focus ends, the coffee is served — start your
break and sip it slowly while the café-service messages roll in.

Built with **React 19 + Vite + TypeScript**. The interface is crisp HTML/CSS;
the café itself is a full-screen **React Three Fiber** scene with a local HDRI,
a real GLTF table, PBR materials, soft shadows and postprocessing.

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
   ticket. Focus defaults to 25 minutes, break to 5.
3. **Focus.** Load the mug and start. The machine brews while the clock ring
   fills; the cup sits in front of the group head and the espresso stream is
   visible while it pours.
4. **Coffee is served.** Focus completion serves the drink — it does **not**
   auto-start the break. Start the break from the order ticket or the toast.
5. **Take your break.** Sip from the cup during the break. Each sip lowers the
   coffee by 20% (five sips empty the cup). The LCD and order ticket show café
   service messages — serving other customers, steaming oat milk, wiping the
   counter, and so on.
6. **Back to it.** The break ends, the cup is cleared, and the next focus is
   ready. The session count increments once per completed focus.

## Features

**The 3D café**

- Full-screen React Three Fiber scene with a warm, eye-level camera. The table
  and machine are centred in the composition instead of sitting in a corner.
- Local Poly Haven **Comfy Café** HDRI powers environment light and the
  reflections on chrome, glass and glazed ceramic.
- Real Poly Haven **WoodenTable_01** GLTF table, plus PBR wood, floor, plaster,
  metal, porcelain and cork maps from ambientCG.
- Detailed espresso machine built from Three.js geometry: forest-green
  powder-coated body, brushed steel faceplate, chrome group head, angled
  portafilter with a wooden handle, gauges, LCD, knurled knobs, steam wands,
  drip tray and a cup warmer.
- Big cappuccino cup on a saucer, a visible espresso stream, splash ring and
  cup steam. The same cup travels from the coaster to the machine tray and back.
- Wall-mounted cup shelf with six ceramic glazes: porcelain, sage, terracotta,
  cobalt, honey and rose. Cups sit fully on the shelf and remain crisp and
  clickable — there is deliberately **no depth-of-field blur on the interactive
  cups**.
- Natural window light, warm practical lights, a low front fill, soft directional
  shadows, contact shadows, ambient occlusion (N8AO), subtle bloom and a
  vignette.
- Responsive camera framing and a reduced-motion mode that keeps the scene
  static.

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

**Sound**

- Every sound is synthesised at runtime with the Web Audio API; there are no
  audio files to download.
- The gentle pour puff is a filtered noise + low gurgle layer, triggered when
  brewing starts and occasionally during the first part of a focus session.
- Global mute and lo-fi ambience are independent.

**Controls and polish**

- Load or return the mug by dragging **or tapping** it.
- Keyboard shortcuts: `Space` (start/pause/resume), `S` (sip when coffee is
  served), `M` (mute), `?` (help), `Esc` (close dialogs).
- Toast actions for starting the break, taking a sip, or beginning the next
  focus.
- Persisted preferences and session count via `localStorage` (`cm.*` keys).
- Document title reflects the running focus/break state.
- Deadline-based timer (no drift while the tab is throttled or backgrounded).
- Accessible dialogs with focus trapping, `aria-live` machine status, visible
  keyboard focus, and reduced-motion support.
- Responsive desktop composition becomes a focused single-column scene on
  tablets and phones, with the order ticket moving into a drawer or bottom
  sheet.

## Architecture

- **UI:** React function components with TypeScript and CSS overlays layered
  over the canvas.
- **3D:** `@react-three/fiber` + `@react-three/drei` for the scene, GLTF/HDR
  loading and soft shadows. `@react-three/postprocessing`, `postprocessing` and
  `n8ao` provide ambient occlusion, bloom and vignette.
- **Domain:** brewing/break logic lives in the object-oriented
  `PomodoroEspressoMachine`, built on the abstract `BaseBrewingAppliance`, and
  is bridged to React through `usePomodoroMachine`. Timer state is mode-aware
  (`focus` / `break`, `idle` / `running` / `paused` / `complete`) and
  snapshot-driven.
- **Assets:** paths live in `src/three/assets.ts`; `usePbrTextures` loads,
  tiles and caches PBR maps. `src/three/textures.ts` keeps the small procedural
  LCD, gauge, steam and shadow textures.
- **Audio:** Web Audio synthesis is encapsulated in `AmbientSoundSystem`.
- **Data:** drinks, cup styles, presets, sip constants and service messages
  live in `src/data/cafe.ts`.

## Project structure

```text
index.html                        Vite entry
src/
  main.tsx                        React root
  App.tsx                         Screen flow, focus/break/cup/coffee state
  types.ts                        Shared domain types
  audio/
    AmbientSoundSystem.ts         Clicks, steam, pour puff, sip, chime, lo-fi
  data/
    cafe.ts                       Drinks, cup glazes, presets, service messages
  domain/
    PomodoroEspressoMachine.ts    Focus/break engine + abstract base class
  hooks/
    usePomodoroMachine.ts         React bridge for the machine
  components/
    FocusCard.tsx                 Timer, primary action and session controls
    OrderTicket.tsx               Drinks, focus/break config, cup selection
    TopBar.tsx, ServiceTicker.tsx
    HelpDialog.tsx, WelcomeDialog.tsx, ExitDialog.tsx, Modal.tsx
  three/
    CafeScene.tsx                 Canvas, camera, lighting, postprocessing
    CafeRoom.tsx                  Room, window, curtains, pendant, plant
    CafeTable.tsx                 GLTF table, props, cup movement
    MachineModel.tsx              Espresso machine, pour stream
    CupModel.tsx                  Ceramic cup, saucer, coffee, steam
    MugShelf.tsx                  Wall shelf and selectable cups
    assets.ts                     Local asset paths
    usePbrTextures.ts             PBR loading, tiling and cache
    textures.ts                   LCD/gauge/steam/shadow textures
  lib/
    format.ts                     Time formatting / clamping
    cup.ts, storage.ts            Cup helpers and safe localStorage
  styles/
    base.css, scene.css, machine.css, overlays.css, responsive.css
public/
  hdri/                           Local Comfy Café HDRI
  models/wooden-table/            Poly Haven table GLTF + textures
  textures/                       ambientCG PBR maps
legacy/
  pomodoro-original.html          Preserved original single-file version
```

The other HTML experiments (`cozy_office_coffee_maker.html`,
`pomodoroCoffeeMachine.html`) were left untouched.

## Assets and credits

All bundled 3D assets are local and CC0. See [`ASSETS.md`](./ASSETS.md) for
source links and details.

- **Comfy Café HDRI** — Poly Haven, CC0.
- **WoodenTable_01** — Poly Haven, CC0.
- **Wood051, WoodFloor064, Metal009, PaintedPlaster017, Porcelain001,
  Cork001** — ambientCG, CC0.
- The espresso machine, cups, saucer, spoon and small props are custom Three.js
  geometry built for this project.

## Notes

- Audio starts on the first user gesture, as required by browser autoplay
  policies.
- The coffee-served toast stays until you start the break or take a sip; the
  break-complete toast stays until the next focus starts.
- Custom duration inputs apply on **Enter** or the **Set** button and are
  clamped to the allowed range.
- Preferences and the session count are device-local; clearing site data resets
  them.
