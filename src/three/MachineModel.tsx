import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { CupSpot, Drink, MachineSnapshot } from "../types";
import { CUP_STYLES } from "../data/cafe";
import { formatClock } from "../lib/format";
import { TEXTURES } from "./assets";
import { COFFEE_COLORS } from "./palette";
import { CupModel } from "./CupModel";
import { Steam } from "./Steam";
import {
  createGaugeTexture,
  createLabelTexture,
  drawLcd,
} from "./textures";
import { usePbrTextures } from "./usePbrTextures";

interface MachineModelProps {
  snapshot: MachineSnapshot;
  drink: Drink;
  serviceMessage: string;
  cupSpot: CupSpot;
  position?: [number, number, number];
}

interface RodProps {
  start: [number, number, number];
  end: [number, number, number];
  radius?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
  material?: THREE.Material;
}

function Rod({
  start,
  end,
  radius = 0.008,
  color = "#dfe8ed",
  metalness = 1,
  roughness = 0.12,
  material,
}: RodProps) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const midpoint = a.clone().add(b).multiplyScalar(0.5);
    const direction = b.clone().sub(a);
    const nextLength = direction.length();
    const nextQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize(),
    );
    return {
      position: midpoint,
      quaternion: nextQuaternion,
      length: nextLength,
    };
  }, [start, end]);

  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, 20]} />
      {material ? (
        <primitive object={material} attach="material" />
      ) : (
        <meshStandardMaterial
          color={color}
          metalness={metalness}
          roughness={roughness}
        />
      )}
    </mesh>
  );
}

interface GaugeProps {
  position: [number, number, number];
  value: number;
  texture: THREE.Texture;
}

function Gauge({ position, value, texture }: GaugeProps) {
  const needle = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!needle.current) return;
    const target = -2.05 + THREE.MathUtils.clamp(value, 0, 1) * 2.9;
    needle.current.rotation.z = THREE.MathUtils.damp(
      needle.current.rotation.z,
      target,
      5,
      delta,
    );
  });

  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.058, 0.058, 0.028, 48]} />
        <meshStandardMaterial
          color="#d6dfe3"
          metalness={1}
          roughness={0.13}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <circleGeometry args={[0.051, 56]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <torusGeometry args={[0.056, 0.004, 12, 56]} />
        <meshStandardMaterial
          color="#eef4f6"
          metalness={1}
          roughness={0.08}
          envMapIntensity={1.6}
        />
      </mesh>
      <mesh position={[0, 0, 0.0255]}>
        <circleGeometry args={[0.05, 56]} />
        <meshPhysicalMaterial
          color="#dcebed"
          transparent
          opacity={0.16}
          roughness={0.035}
          metalness={0.15}
          envMapIntensity={1.8}
          depthWrite={false}
        />
      </mesh>
      <group ref={needle} position={[0, 0, 0.0205]}>
        <mesh position={[0, 0.033, 0]} castShadow>
          <boxGeometry args={[0.0035, 0.07, 0.0025]} />
          <meshStandardMaterial
            color="#d8a15d"
            metalness={0.55}
            roughness={0.26}
          />
        </mesh>
        <mesh position={[0, 0, 0.002]}>
          <cylinderGeometry args={[0.009, 0.009, 0.005, 24]} />
          <meshStandardMaterial color="#4a2d18" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

interface LcdPanelProps {
  snapshot: MachineSnapshot;
  drink: Drink;
  serviceMessage: string;
}

function LcdPanel({ snapshot, drink, serviceMessage }: LcdPanelProps) {
  const { canvas, ctx, texture } = useMemo(() => {
    const nextCanvas = document.createElement("canvas");
    nextCanvas.width = 512;
    nextCanvas.height = 224;
    const nextCtx = nextCanvas.getContext("2d");
    if (!nextCtx) throw new Error("2D canvas unavailable");
    const nextTexture = new THREE.CanvasTexture(nextCanvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.anisotropy = 8;
    return { canvas: nextCanvas, ctx: nextCtx, texture: nextTexture };
  }, []);

  const status = useMemo(() => {
    const clock = formatClock(snapshot.remainingMs);
    const progress = snapshot.progress;
    if (snapshot.mode === "break") {
      if (snapshot.phase === "running") {
        return {
          main: `BREAK ${clock}`,
          sub: serviceMessage.toUpperCase(),
          progress,
          tone: "break" as const,
        };
      }
      if (snapshot.phase === "paused") {
        return {
          main: "BREAK HOLD",
          sub: "CAFÉ SERVICE PAUSED",
          progress,
          tone: "break" as const,
        };
      }
      if (snapshot.phase === "complete") {
        return {
          main: "CUP CLEAR",
          sub: "READY FOR NEXT FOCUS",
          progress: 1,
          tone: "idle" as const,
        };
      }
      return {
        main: "BREAK",
        sub: "THE CAFÉ IS COVERED",
        progress: 0,
        tone: "idle" as const,
      };
    }

    if (snapshot.phase === "running") {
      return {
        main: `BREW ${clock}`,
        sub: `${drink.bars.toFixed(1)} BAR · ${snapshot.waterMl} ML · ${snapshot.beansG} G`,
        progress,
        tone: "focus" as const,
      };
    }
    if (snapshot.phase === "paused") {
      return {
        main: `HOLD ${clock}`,
        sub: "EXTRACTION PAUSED",
        progress,
        tone: "focus" as const,
      };
    }
    if (snapshot.phase === "complete") {
      return {
        main: "SERVED",
        sub: `${drink.name.toUpperCase()} · ENJOY`,
        progress: 1,
        tone: "ready" as const,
      };
    }
    return {
      main: "READY",
      sub: `${drink.name.toUpperCase()} · LOAD THE MUG`,
      progress: 0,
      tone: "idle" as const,
    };
  }, [drink, serviceMessage, snapshot]);

  useEffect(() => {
    drawLcd(ctx, canvas.width, canvas.height, status);
    texture.needsUpdate = true;
  }, [canvas, ctx, status, texture]);

  return (
    <group position={[0.09, 0.52, 0.301]}>
      <mesh>
        <planeGeometry args={[0.33, 0.11]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.0012]}>
        <planeGeometry args={[0.34, 0.12]} />
        <meshPhysicalMaterial
          color="#0e1712"
          transmission={0.12}
          transparent
          opacity={0.16}
          roughness={0.06}
          metalness={0.2}
          envMapIntensity={1.2}
        />
      </mesh>
    </group>
  );
}

interface PourStreamProps {
  active: boolean;
  color: string;
}

function PourStream({ active, color }: PourStreamProps) {
  const group = useRef<THREE.Group>(null);
  const splash = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.visible = active;
    if (active) {
      const pulse = 0.78 + Math.sin(clock.elapsedTime * 18) * 0.12;
      group.current.scale.set(1, pulse, 1);
      if (splash.current) {
        const cycle = (clock.elapsedTime * 2.4) % 1;
        splash.current.scale.setScalar(0.7 + cycle * 0.8);
        (splash.current.material as THREE.MeshBasicMaterial).opacity =
          0.55 * (1 - cycle);
      }
    }
  });

  return (
    <group ref={group} position={[0, 0.22, 0.39]}>
      <mesh>
        <cylinderGeometry args={[0.0034, 0.0058, 0.085, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.94}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.002, 0.001]}>
        <cylinderGeometry args={[0.0012, 0.0024, 0.066, 8]} />
        <meshBasicMaterial
          color="#f3d4a2"
          transparent
          opacity={0.72}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, -0.038, 0]}>
        <sphereGeometry args={[0.0078, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={splash} position={[0, -0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.007, 0.016, 28]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.55}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function KnurledKnob({
  position,
  size = 0.032,
  color = "#1c1f1e",
  indicator = "#d9a15f",
}: {
  position: [number, number, number];
  size?: number;
  color?: string;
  indicator?: string;
}) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[size, size, 0.025, 32]} />
        <meshStandardMaterial
          color={color}
          metalness={0.72}
          roughness={0.32}
          envMapIntensity={1.1}
        />
      </mesh>
      <mesh position={[0, 0, 0.014]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[size * 0.72, size * 0.075, 10, 40]} />
        <meshStandardMaterial
          color="#c6d2d6"
          metalness={1}
          roughness={0.16}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh position={[0, 0, 0.017]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[size * 0.54, size * 0.54, 0.008, 32]} />
        <meshStandardMaterial
          color="#aeb9bd"
          metalness={1}
          roughness={0.2}
          envMapIntensity={1.4}
        />
      </mesh>
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[size * 0.08, size * 0.72, 0.002]} />
        <meshStandardMaterial
          color={indicator}
          emissive={indicator}
          emissiveIntensity={0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function MachineModel({
  snapshot,
  drink,
  serviceMessage,
  cupSpot,
  position = [0.35, 0.78, -0.04],
}: MachineModelProps) {
  const metal = usePbrTextures(TEXTURES.metal, [1.2, 1]);
  const wood = usePbrTextures(TEXTURES.wood, [0.8, 0.8]);
  const gaugeTextures = useMemo(
    () => [createGaugeTexture("bar"), createGaugeTexture("steam")],
    [],
  );
  const brandTexture = useMemo(
    () =>
      createLabelTexture("OFFICINA POMODORO", {
        color: "#ecd7ad",
        background: "#17211b",
        font: "600 30px Georgia, serif",
      }),
    [],
  );

  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        map: metal.color,
        normalMap: metal.normal,
        roughnessMap: metal.roughness,
        metalnessMap: metal.metalness,
        color: "#416e54",
        metalness: 0.34,
        roughness: 0.42,
        normalScale: new THREE.Vector2(0.5, 0.5),
        envMapIntensity: 1.65,
      }),
      steel: new THREE.MeshStandardMaterial({
        map: metal.color,
        normalMap: metal.normal,
        roughnessMap: metal.roughness,
        metalnessMap: metal.metalness,
        color: "#d5dfe1",
        metalness: 0.92,
        roughness: 0.34,
        normalScale: new THREE.Vector2(0.5, 0.5),
        envMapIntensity: 1.95,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: "#edf3f4",
        metalness: 1,
        roughness: 0.065,
        envMapIntensity: 1.9,
      }),
      darkMetal: new THREE.MeshStandardMaterial({
        color: "#3c4648",
        metalness: 0.84,
        roughness: 0.32,
        envMapIntensity: 1.35,
      }),
      black: new THREE.MeshStandardMaterial({
        color: "#1b211f",
        metalness: 0.42,
        roughness: 0.46,
        envMapIntensity: 1.0,
      }),
      rubber: new THREE.MeshStandardMaterial({
        color: "#171b19",
        metalness: 0.08,
        roughness: 0.82,
      }),
      brass: new THREE.MeshStandardMaterial({
        color: "#c99755",
        metalness: 1,
        roughness: 0.25,
        envMapIntensity: 1.45,
      }),
      wood: new THREE.MeshStandardMaterial({
        map: wood.color,
        normalMap: wood.normal,
        roughnessMap: wood.roughness,
        color: "#7b4d2d",
        metalness: 0.02,
        roughness: 0.52,
        envMapIntensity: 0.75,
      }),
      cloth: new THREE.MeshStandardMaterial({
        color: "#baa98f",
        roughness: 0.96,
        metalness: 0,
      }),
    }),
    [metal, wood],
  );

  const running = snapshot.phase === "running";
  const focusRunning = running && snapshot.mode === "focus";
  const pouring = focusRunning && cupSpot === "tray";
  const pressure =
    snapshot.mode === "focus" && (running || snapshot.phase === "paused")
      ? 0.62 + Math.sin(snapshot.progress * 18) * 0.12
      : 0.12;
  const steamPressure = running && snapshot.mode === "break" ? 0.7 : 0.2;
  const coffee = COFFEE_COLORS[drink.id];

  return (
    <group position={position}>
      {/* Rubber feet with chrome collars */}
      {[
        [-0.41, 0.012, -0.21],
        [0.41, 0.012, -0.21],
        [-0.41, 0.012, 0.21],
        [0.41, 0.012, 0.21],
      ].map((foot, index) => (
        <group key={index} position={foot as [number, number, number]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.026, 0.031, 0.026, 28]} />
            <primitive object={materials.rubber} attach="material" />
          </mesh>
          <mesh position={[0, 0.018, 0]} castShadow>
            <cylinderGeometry args={[0.023, 0.026, 0.007, 28]} />
            <primitive object={materials.chrome} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Main chassis, finished in deep forest green */}
      <RoundedBox
        args={[0.94, 0.56, 0.54]}
        radius={0.026}
        smoothness={4}
        position={[0, 0.31, 0]}
        castShadow
        receiveShadow
        material={materials.body}
      />

      {/* Dark top band and cup warmer tray */}
      <RoundedBox
        args={[0.9, 0.035, 0.48]}
        radius={0.012}
        smoothness={3}
        position={[0, 0.6, 0]}
        castShadow
        material={materials.darkMetal}
      />
      <mesh position={[0, 0.62, 0.215]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.8, 20]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>
      <mesh position={[0, 0.62, -0.215]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.8, 20]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>
      <mesh
        position={[-0.34, 0.626, -0.07]}
        rotation={[-0.06, 0, 0.03]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.24, 0.012, 0.19]} />
        <primitive object={materials.cloth} attach="material" />
      </mesh>

      {/* Cups warming on top */}
      {[1, 3, 5].map((cupIndex, index) => (
        <CupModel
          key={cupIndex}
          cupStyle={CUP_STYLES[cupIndex] ?? CUP_STYLES[0]}
          drinkId={drink.id}
          position={[0.11 + index * 0.13, 0.625, -0.04]}
          rotation={[0, index * 0.35 - 0.2, 0]}
          scale={0.72}
        />
      ))}

      {/* Brushed stainless faceplate with a dark control inset */}
      <RoundedBox
        args={[0.9, 0.39, 0.022]}
        radius={0.013}
        smoothness={4}
        position={[0, 0.405, 0.264]}
        castShadow
        material={materials.steel}
      />
      <RoundedBox
        args={[0.8, 0.15, 0.03]}
        radius={0.012}
        smoothness={4}
        position={[0, 0.525, 0.279]}
        castShadow
        material={materials.darkMetal}
      />
      <mesh position={[0, 0.443, 0.284]} castShadow>
        <boxGeometry args={[0.51, 0.022, 0.009]} />
        <primitive object={materials.brass} attach="material" />
      </mesh>
      <mesh position={[0, 0.443, 0.2905]}>
        <planeGeometry args={[0.49, 0.016]} />
        <meshBasicMaterial map={brandTexture} toneMapped={false} />
      </mesh>

      <Gauge position={[-0.315, 0.52, 0.298]} value={pressure} texture={gaugeTextures[0]} />
      <Gauge
        position={[-0.19, 0.52, 0.298]}
        value={steamPressure}
        texture={gaugeTextures[1]}
      />
      <LcdPanel snapshot={snapshot} drink={drink} serviceMessage={serviceMessage} />

      {/* Rotary controls and power/status lamps */}
      <KnurledKnob position={[0.355, 0.55, 0.299]} size={0.033} indicator="#d7a35f" />
      <KnurledKnob position={[0.355, 0.46, 0.299]} size={0.028} indicator="#c87954" />
      <group position={[0.355, 0.38, 0.299]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.016, 28]} />
          <primitive object={materials.black} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <circleGeometry args={[0.009, 24]} />
          <meshStandardMaterial
            color={running ? "#8bf0c0" : "#d5a15e"}
            emissive={running ? "#8bf0c0" : "#d5a15e"}
            emissiveIntensity={running ? 0.85 : 0.35}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Panel seams and screws */}
      {[
        [-0.43, 0.25],
        [0.43, 0.25],
        [-0.43, 0.55],
        [0.43, 0.55],
      ].map(([x, y], index) => (
        <mesh key={index} position={[x, y, 0.277]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.006, 16]} />
          <primitive object={materials.chrome} attach="material" />
        </mesh>
      ))}

      {/* Group head, gasket and portafilter */}
      <mesh position={[0, 0.34, 0.312]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.092, 0.092, 0.11, 44]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>
      <mesh position={[0, 0.34, 0.37]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.026, 40]} />
        <primitive object={materials.darkMetal} attach="material" />
      </mesh>
      <mesh position={[0, 0.27, 0.382]} castShadow>
        <cylinderGeometry args={[0.062, 0.057, 0.035, 40]} />
        <primitive object={materials.black} attach="material" />
      </mesh>
      <mesh position={[0, 0.265, 0.4]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.012, 40]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>
      <Rod
        start={[0, 0.27, 0.402]}
        end={[0.04, 0.27, 0.47]}
        radius={0.014}
        color="#c6d0d3"
        metalness={1}
        roughness={0.18}
      />
      <Rod
        start={[0.04, 0.27, 0.47]}
        end={[0.17, 0.27, 0.58]}
        radius={0.018}
        material={materials.wood}
      />
      <mesh position={[0, 0.245, 0.395]} castShadow>
        <cylinderGeometry args={[0.015, 0.019, 0.022, 22]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>

      {/* Drip tray with a stainless grate and a small scale */}
      <RoundedBox
        args={[0.74, 0.04, 0.32]}
        radius={0.009}
        smoothness={3}
        position={[0, 0.045, 0.37]}
        castShadow
        receiveShadow
        material={materials.black}
      />
      <mesh position={[0, 0.066, 0.37]} receiveShadow>
        <boxGeometry args={[0.63, 0.006, 0.22]} />
        <primitive object={materials.darkMetal} attach="material" />
      </mesh>
      {Array.from({ length: 11 }).map((_, index) => (
        <mesh
          key={index}
          position={[-0.29 + index * 0.058, 0.07, 0.37]}
          receiveShadow
        >
          <boxGeometry args={[0.007, 0.004, 0.21]} />
          <primitive object={materials.chrome} attach="material" />
        </mesh>
      ))}
      <mesh position={[0, 0.069, 0.532]} castShadow>
        <boxGeometry args={[0.7, 0.014, 0.016]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>
      <group position={[0, 0.069, 0.365]}>
        <mesh receiveShadow>
          <boxGeometry args={[0.2, 0.007, 0.17]} />
          <meshStandardMaterial color="#111514" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.005, 0.082]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.07, 0.022]} />
          <meshStandardMaterial
            color="#8ce8b9"
            emissive="#5bd193"
            emissiveIntensity={0.9}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Steam and hot water wands */}
      <mesh position={[0.44, 0.33, 0.27]} castShadow>
        <sphereGeometry args={[0.026, 24, 18]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>
      <Rod
        start={[0.47, 0.32, 0.28]}
        end={[0.53, 0.14, 0.4]}
        radius={0.01}
      />
      <Rod
        start={[0.5, 0.23, 0.34]}
        end={[0.52, 0.16, 0.38]}
        radius={0.014}
        color="#1b1e1c"
        metalness={0.1}
        roughness={0.78}
      />
      <mesh position={[0.53, 0.125, 0.4]} castShadow>
        <cylinderGeometry args={[0.014, 0.011, 0.038, 24]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>
      {[-0.004, 0, 0.004].map((x, index) => (
        <mesh key={index} position={[0.53 + x, 0.106, 0.4]}>
          <circleGeometry args={[0.0018, 10]} />
          <meshBasicMaterial color="#101412" />
        </mesh>
      ))}
      <Steam
        active={running}
        position={[0.53, 0.1, 0.4]}
        count={6}
        height={0.22}
        spread={0.045}
        size={0.05}
        opacity={0.15}
      />

      <mesh position={[-0.44, 0.32, 0.27]} castShadow>
        <sphereGeometry args={[0.023, 24, 18]} />
        <primitive object={materials.chrome} attach="material" />
      </mesh>
      <Rod
        start={[-0.47, 0.31, 0.28]}
        end={[-0.53, 0.16, 0.38]}
        radius={0.009}
      />
      <Rod
        start={[-0.5, 0.23, 0.33]}
        end={[-0.52, 0.18, 0.37]}
        radius={0.013}
        color="#1b1e1c"
        metalness={0.1}
        roughness={0.78}
      />

      {/* Side vents and service panel */}
      {[1, -1].map((side) => (
        <group key={side}>
          {Array.from({ length: 6 }).map((_, index) => (
            <mesh
              key={index}
              position={[0.472 * side, 0.15 + index * 0.035, -0.04]}
              castShadow
            >
              <boxGeometry args={[0.008, 0.011, 0.19]} />
              <primitive object={materials.black} attach="material" />
            </mesh>
          ))}
          <mesh position={[0.473 * side, 0.36, 0.17]} castShadow>
            <boxGeometry args={[0.007, 0.15, 0.055]} />
            <primitive object={materials.brass} attach="material" />
          </mesh>
        </group>
      ))}

      <PourStream active={pouring} color={coffee.crema} />
    </group>
  );
}
