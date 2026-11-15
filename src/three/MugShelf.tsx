import { useMemo } from "react";
import * as THREE from "three";
import { CUP_STYLES } from "../data/cafe";
import type { CupId, DrinkId } from "../types";
import { TEXTURES } from "./assets";
import { CupModel } from "./CupModel";
import { createLabelTexture } from "./textures";
import { usePbrTextures } from "./usePbrTextures";

interface MugShelfProps {
  selectedCupId: CupId;
  drinkId: DrinkId;
  disabled: boolean;
  onSelect: (cupId: CupId) => void;
}

const CUP_X = [-0.62, -0.37, -0.12, 0.13, 0.38, 0.63];

export function MugShelf({
  selectedCupId,
  drinkId,
  disabled,
  onSelect,
}: MugShelfProps) {
  const wood = usePbrTextures(TEXTURES.wood, [1.4, 1.1]);

  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: wood.color,
        normalMap: wood.normal,
        roughnessMap: wood.roughness,
        color: "#a47b50",
        roughness: 1,
        metalness: 0.02,
        normalScale: new THREE.Vector2(0.7, 0.7),
        envMapIntensity: 0.8,
      }),
    [wood],
  );

  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b98a50",
        metalness: 1,
        roughness: 0.26,
        envMapIntensity: 1.4,
      }),
    [],
  );

  const labelTexture = useMemo(
    () =>
      createLabelTexture("THE MUG WALL", {
        color: "#e0bc82",
        font: "600 30px Georgia, serif",
      }),
    [],
  );

  return (
    <group position={[-0.35, 0, -1.56]}>
      {/* Shelf slab */}
      <mesh position={[0, 1.49, 0]} castShadow receiveShadow material={woodMaterial}>
        <boxGeometry args={[1.52, 0.075, 0.3]} />
      </mesh>
      <mesh position={[0, 1.472, 0.145]} castShadow material={woodMaterial}>
        <boxGeometry args={[1.52, 0.092, 0.04]} />
      </mesh>
      <mesh position={[0, 1.448, 0.13]} receiveShadow>
        <boxGeometry args={[1.45, 0.008, 0.024]} />
        <meshStandardMaterial
          color="#f0b66f"
          emissive="#f0b66f"
          emissiveIntensity={0.55}
          toneMapped={false}
        />
      </mesh>

      {/* Brass brackets */}
      {[-0.56, 0.56].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.37, -0.075]} castShadow material={brassMaterial}>
            <boxGeometry args={[0.026, 0.26, 0.026]} />
          </mesh>
          <mesh
            position={[0, 1.485, -0.035]}
            rotation={[0, 0, 0]}
            castShadow
            material={brassMaterial}
          >
            <boxGeometry args={[0.026, 0.026, 0.2]} />
          </mesh>
        </group>
      ))}

      {/* Label on the shelf edge */}
      <mesh position={[0, 1.472, 0.168]}>
        <planeGeometry args={[0.62, 0.072]} />
        <meshBasicMaterial map={labelTexture} transparent toneMapped={false} />
      </mesh>

      {CUP_STYLES.map((cup, index) => (
        <CupModel
          key={cup.id}
          cupStyle={cup}
          drinkId={drinkId}
          position={[CUP_X[index] ?? 0, 1.53, 0.01]}
          rotation={[0, (index % 3 - 1) * 0.16, 0]}
          scale={1.5}
          selected={selectedCupId === cup.id}
          interactive={!disabled}
          onActivate={() => onSelect(cup.id)}
        />
      ))}
    </group>
  );
}
