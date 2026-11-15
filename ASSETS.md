# Asset credits

All bundled 3D assets are stored locally under `public/` and are **CC0**
(public-domain dedication). Attribution is not required by the licences, but
the original creators are credited here as a courtesy.

## Environment

| Asset | Files | Source | Licence |
| --- | --- | --- | --- |
| Comfy Café HDRI (1K HDR) | `public/hdri/comfy_cafe_1k.hdr` | [Poly Haven — Comfy Café](https://polyhaven.com/a/comfy_cafe) | CC0 |

Used for image-based lighting, reflections and the warm café ambience.

## Furniture

| Asset | Files | Source | Licence |
| --- | --- | --- | --- |
| Wooden Table 01 | `public/models/wooden-table/WoodenTable_01.gltf`, `.bin`, `textures/*` | [Poly Haven — Wooden Table 01](https://polyhaven.com/a/WoodenTable_01) | CC0 |

The GLTF is loaded in `src/three/CafeTable.tsx`. The table is the only
downloaded 3D model in the scene; the espresso machine, cups, saucer, spoon
and small props are custom Three.js geometry.

## PBR materials

All texture sets are **1K JPG** downloads from [ambientCG](https://ambientcg.com/).

| Material | Files | Source | Licence |
| --- | --- | --- | --- |
| Wood | `public/textures/wood/Wood051_1K-JPG_*` | [Wood051](https://ambientcg.com/view?id=Wood051) | CC0 |
| Wood floor | `public/textures/floor/WoodFloor064_1K-JPG_*` | [WoodFloor064](https://ambientcg.com/view?id=WoodFloor064) | CC0 |
| Metal | `public/textures/metal/Metal009_1K-JPG_*` | [Metal009](https://ambientcg.com/view?id=Metal009) | CC0 |
| Painted plaster | `public/textures/plaster/PaintedPlaster017_1K-JPG_*` | [PaintedPlaster017](https://ambientcg.com/view?id=PaintedPlaster017) | CC0 |
| Porcelain | `public/textures/porcelain/Porcelain001_1K-JPG_*` | [Porcelain001](https://ambientcg.com/view?id=Porcelain001) | CC0 |
| Cork | `public/textures/cork/Cork001_1K-JPG_*` | [Cork001](https://ambientcg.com/view?id=Cork001) | CC0 |

Paths and tiling are centralised in `src/three/assets.ts`. Textures are loaded,
cloned for independent tiling and cached by `src/three/usePbrTextures.ts`.

## Type and icon resources

- **Fraunces**, **Manrope** and **JetBrains Mono** are bundled through
  [`@fontsource-variable`](https://fontsource.org/) under the SIL Open Font
  License.
- Interface icons are inline SVG components in `src/components/icons.tsx`.

## Software

- [Three.js](https://threejs.org/) — MIT
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — MIT
- [Drei](https://github.com/pmndrs/drei) — MIT
- [postprocessing](https://github.com/pmndrs/postprocessing) — Zlib
- [N8AO](https://github.com/n8python/n8ao) — MIT
- [React](https://react.dev/) — MIT
- [Vite](https://vite.dev/) — MIT

## Notes on reuse

CC0 assets may be reused and modified without permission. If you redistribute
this project, keep this file with the downloaded assets so their origin remains
clear. The custom Three.js models in `src/three/` are original project code.
