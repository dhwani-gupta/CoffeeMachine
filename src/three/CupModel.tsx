import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { CupStyle, DrinkId } from "../types";
import { TEXTURES } from "./assets";
import { COFFEE_COLORS } from "./palette";
import { Steam } from "./Steam";
import { usePbrTextures } from "./usePbrTextures";

const CUP_PROFILE = [
  new THREE.Vector2(0.0001, 0),
  new THREE.Vector2(0.027, 0),
  new THREE.Vector2(0.036, 0.004),
  new THREE.Vector2(0.042, 0.014),
  new THREE.Vector2(0.045, 0.035),
  new THREE.Vector2(0.0465, 0.062),
  new THREE.Vector2(0.0457, 0.079),
  new THREE.Vector2(0.0425, 0.088),
  new THREE.Vector2(0.0392, 0.09),
  new THREE.Vector2(0.0362, 0.0875),
  new THREE.Vector2(0.0392, 0.063),
  new THREE.Vector2(0.0365, 0.033),
  new THREE.Vector2(0.03, 0.016),
  new THREE.Vector2(0.0001, 0.015),
];

const SAUCER_PROFILE = [
  new THREE.Vector2(0.0001, 0),
  new THREE.Vector2(0.072, 0),
  new THREE.Vector2(0.088, 0.003),
  new THREE.Vector2(0.094, 0.009),
  new THREE.Vector2(0.091, 0.012),
  new THREE.Vector2(0.074, 0.009),
  new THREE.Vector2(0.07, 0.006),
  new THREE.Vector2(0.0001, 0.006),
];

const LIQUID_MIN = 0.018;
const LIQUID_MAX = 0.081;
const SAUCER_TOP = 0.012;

interface CupModelProps {
  cupStyle: CupStyle;
  drinkId: DrinkId;
  coffeeLevel?: number;
  steam?: boolean;
  selected?: boolean;
  interactive?: boolean;
  saucer?: boolean;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  onActivate?: () => void;
  children?: ReactNode;
}

export function CupModel({
  cupStyle,
  drinkId,
  coffeeLevel = 0,
  steam = false,
  selected = false,
  interactive = false,
  saucer = false,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  onActivate,
  children,
}: CupModelProps) {
  const animated = useRef<THREE.Group>(null);
  const liquid = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const colors = COFFEE_COLORS[drinkId];
  const porcelain = usePbrTextures(TEXTURES.porcelain, [1.5, 1.5]);
  const baseY = saucer ? SAUCER_TOP : 0;

  const handleCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.040, 0.069, 0),
        new THREE.Vector3(0.066, 0.068, 0),
        new THREE.Vector3(0.079, 0.049, 0),
        new THREE.Vector3(0.073, 0.029, 0),
        new THREE.Vector3(0.045, 0.026, 0),
      ]),
    [],
  );

  const ceramicMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: cupStyle.light,
        normalMap: porcelain.normal,
        normalScale: new THREE.Vector2(0.09, 0.09),
        roughnessMap: porcelain.roughness,
        roughness: 0.32,
        metalness: 0.01,
        clearcoat: 1,
        clearcoatRoughness: 0.075,
        ior: 1.5,
        specularIntensity: 1,
        envMapIntensity: 1.18,
        sheen: 0.12,
        sheenColor: cupStyle.handle,
        emissive: selected ? cupStyle.glow : "#000000",
        emissiveIntensity: selected ? 0.12 : 0,
        side: THREE.DoubleSide,
      }),
    [cupStyle, porcelain, selected],
  );

  const handleMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: cupStyle.handle,
        normalMap: porcelain.normal,
        normalScale: new THREE.Vector2(0.08, 0.08),
        roughness: 0.28,
        metalness: 0.01,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.1,
      }),
    [cupStyle, porcelain],
  );

  const spoonMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d5dde0",
        metalness: 1,
        roughness: 0.18,
        envMapIntensity: 1.4,
      }),
    [],
  );

  useFrame((_, delta) => {
    const node = animated.current;
    if (node) {
      const target = selected ? 1.035 : hovered && interactive ? 1.025 : 1;
      const next = THREE.MathUtils.damp(node.scale.x, target, 10, delta);
      node.scale.setScalar(next);
    }

    const liquidNode = liquid.current;
    if (liquidNode) {
      const targetY =
        LIQUID_MIN + Math.min(1, Math.max(0, coffeeLevel)) * (LIQUID_MAX - LIQUID_MIN);
      liquidNode.position.y = THREE.MathUtils.damp(
        liquidNode.position.y,
        targetY,
        9,
        delta,
      );
      liquidNode.visible = coffeeLevel > 0.004;
    }
  });

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (interactive) document.body.style.cursor = "auto";
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={
        interactive
          ? (event) => {
              event.stopPropagation();
              onActivate?.();
            }
          : undefined
      }
      onPointerOver={interactive ? handlePointerOver : undefined}
      onPointerOut={interactive ? handlePointerOut : undefined}
    >
      {saucer && (
        <>
          <mesh castShadow receiveShadow>
            <latheGeometry args={[SAUCER_PROFILE, 56]} />
            <primitive object={ceramicMaterial} attach="material" />
          </mesh>
          <group
            position={[0.058, SAUCER_TOP + 0.004, 0.025]}
            rotation={[0, -0.55, 0]}
          >
            <mesh castShadow>
              <boxGeometry args={[0.088, 0.0035, 0.011]} />
              <primitive object={spoonMaterial} attach="material" />
            </mesh>
            <mesh position={[-0.052, 0, 0]} castShadow>
              <sphereGeometry
                args={[0.018, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]}
              />
              <primitive object={spoonMaterial} attach="material" />
            </mesh>
          </group>
        </>
      )}

      <group ref={animated} position={[0, baseY, 0]}>
        <mesh castShadow receiveShadow>
          <latheGeometry args={[CUP_PROFILE, 64]} />
          <primitive object={ceramicMaterial} attach="material" />
        </mesh>

        <mesh castShadow receiveShadow>
          <tubeGeometry args={[handleCurve, 32, 0.0068, 12, false]} />
          <primitive object={handleMaterial} attach="material" />
        </mesh>

        <mesh
          position={[0, 0.0006, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={selected}
        >
          <ringGeometry args={saucer ? [0.096, 0.105, 48] : [0.05, 0.058, 40]} />
          <meshBasicMaterial
            color={cupStyle.glow}
            transparent
            opacity={0.64}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>

        <group ref={liquid} visible={coffeeLevel > 0.004}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0004, 0]}>
            <circleGeometry args={[0.0345, 48]} />
            <meshPhysicalMaterial
              color={colors.liquid}
              roughness={0.16}
              metalness={0.02}
              clearcoat={0.65}
              clearcoatRoughness={0.18}
              envMapIntensity={1.05}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0011, 0]}>
            <ringGeometry args={[0.0215, 0.0342, 48]} />
            <meshStandardMaterial
              color={colors.crema}
              roughness={0.34}
              metalness={0.01}
              envMapIntensity={0.8}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0018, 0]}>
            <circleGeometry args={[0.0095, 28]} />
            <meshStandardMaterial
              color={colors.crema}
              roughness={0.45}
              transparent
              opacity={0.55}
            />
          </mesh>
        </group>
      </group>

      {/* Invisible hit volume: makes the small table cup forgiving to click. */}
      {interactive && (
        <mesh position={[0, 0.055, 0]} visible={false}>
          <cylinderGeometry args={[saucer ? 0.115 : 0.085, saucer ? 0.115 : 0.07, 0.16, 20]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      <Steam
        active={steam && coffeeLevel > 0.04}
        position={[0, baseY + 0.095, 0]}
        height={0.2}
        spread={0.032}
        size={0.055}
        opacity={0.19}
      />

      {children}
    </group>
  );
}
