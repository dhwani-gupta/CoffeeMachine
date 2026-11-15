import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import {
  Bloom,
  EffectComposer,
  N8AO,
  Vignette,
} from "@react-three/postprocessing";
import * as THREE from "three";
import type { CupId, CupSpot, CupStyle, Drink, MachineSnapshot } from "../types";
import { CAFE_HDRI } from "./assets";
import { CafeRoom } from "./CafeRoom";
import {
  CafeTable,
  COASTER_POSITION,
  MACHINE_POSITION,
  TRAY_CUP_POSITION,
} from "./CafeTable";
import { CupModel } from "./CupModel";
import { MachineModel } from "./MachineModel";
import { MugShelf } from "./MugShelf";
import { createShadowTexture } from "./textures";

interface CafeSceneProps {
  snapshot: MachineSnapshot;
  drink: Drink;
  cupStyle: CupStyle;
  cupId: CupId;
  cupSpot: CupSpot;
  fill: number;
  coffeeReady: boolean;
  cupEditable: boolean;
  serviceMessage: string;
  onSelectCup: (cupId: CupId) => void;
  onCupActivate: () => void;
}

function CameraRig() {
  const { camera, size } = useThree();
  const perspective = camera as THREE.PerspectiveCamera;
  const target = useMemo(() => new THREE.Vector3(0.18, 1.04, -0.02), []);
  const reduceMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame((state, delta) => {
    const mobile = size.width < 900;
    const fov = mobile ? 49 : 38;
    if (Math.abs(perspective.fov - fov) > 0.01) {
      perspective.fov = fov;
      perspective.updateProjectionMatrix();
    }

    const pointerX = reduceMotion ? 0 : state.pointer.x;
    const pointerY = reduceMotion ? 0 : state.pointer.y;
    const drift = reduceMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.1) * 0.006;
    const baseX = mobile ? 0.68 : 0.9;
    const baseY = mobile ? 1.62 : 1.54;
    const baseZ = mobile ? 5.35 : 4.55;

    const nextX = baseX + pointerX * (mobile ? 0.07 : 0.045) + drift;
    const nextY = baseY + pointerY * 0.025;
    const nextZ = baseZ;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, nextX, 2.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, nextY, 2.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, nextZ, 2.5, delta);
    camera.lookAt(target);
  });

  return null;
}

function DustMotes() {
  const { size } = useThree();
  if (size.width < 900) return null;
  return (
    <Sparkles
      count={34}
      scale={[3.2, 2.2, 2.2]}
      position={[-1.35, 1.62, 0.2]}
      size={1.35}
      speed={0.16}
      opacity={0.26}
      color="#ffd7a0"
      noise={0.45}
    />
  );
}

function TableCup({
  cupStyle,
  drink,
  fill,
  cupSpot,
  coffeeReady,
  steam,
  onActivate,
}: {
  cupStyle: CupStyle;
  drink: Drink;
  fill: number;
  cupSpot: CupSpot;
  coffeeReady: boolean;
  steam: boolean;
  onActivate: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const shadowTexture = useMemo(createShadowTexture, []);
  const initial = cupSpot === "tray" ? TRAY_CUP_POSITION : COASTER_POSITION;

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    const target = cupSpot === "tray" ? TRAY_CUP_POSITION : COASTER_POSITION;
    node.position.x = THREE.MathUtils.damp(node.position.x, target[0], 5.5, delta);
    node.position.y = THREE.MathUtils.damp(node.position.y, target[1], 6.5, delta);
    node.position.z = THREE.MathUtils.damp(node.position.z, target[2], 5.5, delta);
  });

  return (
    <group ref={group} position={initial}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[0.52, 0.52]} />
        <meshBasicMaterial
          map={shadowTexture}
          transparent
          opacity={0.52}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group scale={[1.62, 1.06, 1.62]}>
        <CupModel
          cupStyle={cupStyle}
          drinkId={drink.id}
          coffeeLevel={fill}
          steam={steam}
          saucer
          interactive
          onActivate={onActivate}
        />
      </group>
      <pointLight
        position={[0, 0.13, 0]}
        color="#ffc27a"
        intensity={coffeeReady ? 0.55 : 0}
        distance={0.45}
        decay={2}
      />
    </group>
  );
}

function PostFX() {
  const { size } = useThree();
  const mobile = size.width < 900;

  return (
    <EffectComposer multisampling={mobile ? 0 : 2}>
      <N8AO
        quality="performance"
        halfRes
        aoRadius={0.56}
        distanceFalloff={0.82}
        intensity={2.45}
        color="black"
      />
      <Bloom
        intensity={mobile ? 0.22 : 0.28}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.35}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.26} darkness={0.3} />
    </EffectComposer>
  );
}

function SceneContent({
  snapshot,
  drink,
  cupStyle,
  cupId,
  cupSpot,
  fill,
  coffeeReady,
  cupEditable,
  serviceMessage,
  onSelectCup,
  onCupActivate,
}: CafeSceneProps) {
  return (
    <>
      <CameraRig />
      <color attach="background" args={["#101510"]} />
      <fog attach="fog" args={["#151d16", 6.5, 17]} />

      {/* The HDRI does most of the ambient work; these lights shape the room. */}
      <ambientLight intensity={0.13} color="#8fa18f" />
      <directionalLight
        position={[-4.6, 5.4, -2.7]}
        intensity={3.0}
        color="#ffd7b0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-4.5}
        shadow-camera-right={4.5}
        shadow-camera-top={4.5}
        shadow-camera-bottom={-4.5}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-bias={-0.00025}
        shadow-normalBias={0.022}
        shadow-radius={3}
      />
      <directionalLight
        position={[-2.2, 2.8, 3.6]}
        intensity={1.05}
        color="#cddedb"
      />
      <pointLight
        position={[2.8, 1.8, 2.8]}
        intensity={2.6}
        distance={6}
        decay={2}
        color="#ffbf82"
      />
      <pointLight
        position={[-1.7, 1.8, 1.9]}
        intensity={1.9}
        distance={5.5}
        decay={2}
        color="#a9c4c9"
      />
      <pointLight
        position={[0.45, 2.55, 1.7]}
        intensity={3.6}
        distance={3.8}
        decay={2}
        color="#ffe0bb"
      />
      {/* Low front fill keeps the machine's controls and portafilter legible. */}
      <pointLight
        position={[0.4, 1.25, 2.35]}
        intensity={2.6}
        distance={3.4}
        decay={2}
        color="#ffe2c6"
      />
      {/* A warm window pool, angled into the room like late-afternoon sun. */}
      <spotLight
        position={[-2.05, 2.35, -1.25]}
        angle={0.42}
        penumbra={0.86}
        intensity={16}
        distance={6}
        decay={2}
        color="#ffd4a4"
      />

      <Environment
        files={CAFE_HDRI}
        background={false}
        environmentIntensity={0.92}
        resolution={256}
      />

      <CafeRoom />
      <CafeTable />
      <MachineModel
        snapshot={snapshot}
        drink={drink}
        serviceMessage={serviceMessage}
        cupSpot={cupSpot}
        position={MACHINE_POSITION}
      />
      <MugShelf
        selectedCupId={cupId}
        drinkId={drink.id}
        disabled={!cupEditable}
        onSelect={onSelectCup}
      />
      <TableCup
        cupStyle={cupStyle}
        drink={drink}
        fill={fill}
        cupSpot={cupSpot}
        coffeeReady={coffeeReady}
        steam={
          fill > 0.02 ||
          (snapshot.mode === "focus" &&
            snapshot.phase === "running" &&
            cupSpot === "tray")
        }
        onActivate={onCupActivate}
      />
      <DustMotes />
    </>
  );
}

export function CafeScene(props: CafeSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [0.9, 1.54, 4.55], fov: 38, near: 0.1, far: 30 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
        <PostFX />
      </Suspense>
    </Canvas>
  );
}
