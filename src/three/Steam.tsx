import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSteamTexture } from "./textures";

interface SteamProps {
  active: boolean;
  count?: number;
  height?: number;
  spread?: number;
  size?: number;
  opacity?: number;
  position?: [number, number, number];
}

interface SteamSeed {
  phase: number;
  speed: number;
  sway: number;
  x: number;
  z: number;
  scale: number;
}

export function Steam({
  active,
  count = 7,
  height = 0.18,
  spread = 0.035,
  size = 0.05,
  opacity = 0.28,
  position = [0, 0, 0],
}: SteamProps) {
  const group = useRef<THREE.Group>(null);
  const texture = useMemo(createSteamTexture, []);
  const seeds = useMemo<SteamSeed[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        phase: index / count + Math.random() * 0.04,
        speed: 0.16 + Math.random() * 0.11,
        sway: Math.random() * Math.PI * 2,
        x: (Math.random() - 0.5) * spread,
        z: (Math.random() - 0.5) * spread,
        scale: 0.65 + Math.random() * 0.7,
      })),
    [count, spread],
  );

  useFrame(({ clock }) => {
    const node = group.current;
    if (!node) return;
    node.visible = active;
    if (!active) return;

    node.children.forEach((child, index) => {
      const sprite = child as THREE.Sprite;
      const seed = seeds[index];
      if (!seed) return;
      const cycle = (clock.elapsedTime * seed.speed + seed.phase) % 1;
      sprite.position.set(
        seed.x + Math.sin(cycle * 7 + seed.sway) * 0.018,
        cycle * height,
        seed.z + Math.cos(cycle * 5.2 + seed.sway) * 0.014,
      );
      const scale = size * (0.55 + cycle * 1.8) * seed.scale;
      sprite.scale.setScalar(scale);
      const material = sprite.material as THREE.SpriteMaterial;
      material.opacity = Math.sin(cycle * Math.PI) * opacity;
    });
  });

  return (
    <group ref={group} position={position}>
      {seeds.map((_seed, index) => (
        <sprite key={index} scale={0.01}>
          <spriteMaterial
            map={texture}
            transparent
            depthWrite={false}
            color="#fff5e3"
            blending={THREE.AdditiveBlending}
            opacity={0}
          />
        </sprite>
      ))}
    </group>
  );
}
