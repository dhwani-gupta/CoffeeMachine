import { useMemo } from "react";
import * as THREE from "three";
import { TEXTURES } from "./assets";
import {
  createLabelTexture,
  createSteamTexture,
  createWindowTexture,
} from "./textures";
import { usePbrTextures } from "./usePbrTextures";

function makeCurtainGeometry(width: number, height: number) {
  const geometry = new THREE.PlaneGeometry(width, height, 36, 10);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const fold = Math.sin((x / width + 0.5) * Math.PI * 13) * 0.035;
    const drape = Math.cos((y / height + 0.5) * Math.PI) * 0.008;
    position.setZ(i, fold + drape);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export function CafeRoom() {
  const floor = usePbrTextures(TEXTURES.floor, [4.5, 4.5]);
  const wall = usePbrTextures(TEXTURES.plaster, [3.4, 2.2]);
  const wood = usePbrTextures(TEXTURES.wood, [4.5, 1.1]);
  const trimWood = usePbrTextures(TEXTURES.wood, [5, 0.5], Math.PI / 2);
  const windowTexture = useMemo(createWindowTexture, []);
  const signTexture = useMemo(
    () =>
      createLabelTexture("FOCUS · BREW · BREATHE", {
        color: "#dfb87a",
        background: "#1b2620",
        font: "600 28px Georgia, serif",
      }),
    [],
  );
  const glowTexture = useMemo(createSteamTexture, []);
  const curtainGeometry = useMemo(() => makeCurtainGeometry(0.42, 1.82), []);

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: floor.color,
        normalMap: floor.normal,
        roughnessMap: floor.roughness,
        color: "#b8a18b",
        roughness: 1,
        metalness: 0,
        normalScale: new THREE.Vector2(0.55, 0.55),
        envMapIntensity: 0.5,
      }),
    [floor],
  );

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: wall.color,
        normalMap: wall.normal,
        roughnessMap: wall.roughness,
        color: "#293c31",
        roughness: 1,
        metalness: 0,
        normalScale: new THREE.Vector2(0.45, 0.45),
        envMapIntensity: 0.35,
      }),
    [wall],
  );

  const wainscotMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: wood.color,
        normalMap: wood.normal,
        roughnessMap: wood.roughness,
        color: "#9f7a52",
        roughness: 1,
        metalness: 0.02,
        normalScale: new THREE.Vector2(0.7, 0.7),
        envMapIntensity: 0.8,
      }),
    [wood],
  );

  const trimMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: trimWood.color,
        normalMap: trimWood.normal,
        roughnessMap: trimWood.roughness,
        color: "#6f4d30",
        roughness: 0.7,
        metalness: 0.02,
        envMapIntensity: 0.8,
      }),
    [trimWood],
  );

  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b98b50",
        metalness: 1,
        roughness: 0.28,
        envMapIntensity: 1.4,
      }),
    [],
  );

  const blackMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a1e1c",
        metalness: 0.55,
        roughness: 0.42,
        envMapIntensity: 0.7,
      }),
    [],
  );

  const curtainMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#5b604c",
        roughness: 0.94,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const leafMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#47653e",
        roughness: 0.72,
        metalness: 0,
        side: THREE.DoubleSide,
        envMapIntensity: 0.45,
      }),
    [],
  );

  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        material={floorMaterial}
      >
        <planeGeometry args={[18, 18]} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2.2, -1.72]} receiveShadow material={wallMaterial}>
        <planeGeometry args={[12, 4.4]} />
      </mesh>

      {/* Wainscot, rail and baseboard */}
      <mesh
        position={[0, 0.55, -1.665]}
        castShadow
        receiveShadow
        material={wainscotMaterial}
      >
        <boxGeometry args={[12, 0.92, 0.07]} />
      </mesh>
      {Array.from({ length: 25 }).map((_, index) => (
        <mesh
          key={index}
          position={[-5.76 + index * 0.48, 0.55, -1.625]}
          receiveShadow
        >
          <boxGeometry args={[0.014, 0.86, 0.018]} />
          <meshStandardMaterial color="#2b1d12" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 1.025, -1.64]} castShadow receiveShadow material={trimMaterial}>
        <boxGeometry args={[12, 0.065, 0.15]} />
      </mesh>
      <mesh position={[0, 0.075, -1.655]} castShadow receiveShadow material={trimMaterial}>
        <boxGeometry args={[12, 0.14, 0.1]} />
      </mesh>
      <mesh position={[0, 3.32, -1.665]} receiveShadow material={trimMaterial}>
        <boxGeometry args={[12, 0.08, 0.1]} />
      </mesh>

      {/* Window and its frame */}
      <group position={[-2.15, 2.02, -1.68]}>
        <mesh>
          <planeGeometry args={[1.28, 1.58]} />
          <meshBasicMaterial map={windowTexture} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[1.28, 1.58]} />
          <meshPhysicalMaterial
            color="#f4ddb1"
            transparent
            opacity={0.16}
            roughness={0.08}
            metalness={0.02}
            transmission={0.12}
            thickness={0.004}
          />
        </mesh>
        {[
          { position: [0, 0.83, 0.02] as [number, number, number], size: [1.5, 0.1, 0.12] },
          { position: [0, -0.83, 0.02] as [number, number, number], size: [1.5, 0.1, 0.12] },
          { position: [-0.71, 0, 0.02] as [number, number, number], size: [0.1, 1.68, 0.12] },
          { position: [0.71, 0, 0.02] as [number, number, number], size: [0.1, 1.68, 0.12] },
          { position: [0, 0, 0.02] as [number, number, number], size: [0.035, 1.58, 0.09] },
          { position: [0, 0.13, 0.02] as [number, number, number], size: [1.28, 0.045, 0.09] },
        ].map((piece, index) => (
          <mesh key={index} position={piece.position} castShadow material={blackMaterial}>
            <boxGeometry args={piece.size as [number, number, number]} />
          </mesh>
        ))}

        {/* Brass latch and sill */}
        <mesh position={[0.42, 0.02, 0.09]} castShadow material={brassMaterial}>
          <boxGeometry args={[0.045, 0.09, 0.02]} />
        </mesh>
        <mesh position={[0.42, 0.02, 0.105]} castShadow material={brassMaterial}>
          <cylinderGeometry args={[0.012, 0.012, 0.055, 18]} />
        </mesh>
        <mesh position={[0, -0.9, 0.13]} castShadow receiveShadow material={trimMaterial}>
          <boxGeometry args={[1.62, 0.085, 0.29]} />
        </mesh>
        <mesh position={[0, -0.86, 0.13]} material={brassMaterial}>
          <boxGeometry args={[1.58, 0.008, 0.28]} />
        </mesh>
      </group>

      {/* Curtain rod + linen panels */}
      <group position={[-2.15, 2.99, -1.57]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 1.85, 18]} />
          <primitive object={brassMaterial} attach="material" />
        </mesh>
        {[-0.98, 0.98].map((x) => (
          <mesh key={x} position={[x, 0, 0]} castShadow>
            <sphereGeometry args={[0.035, 20, 16]} />
            <primitive object={brassMaterial} attach="material" />
          </mesh>
        ))}
      </group>
      {[-2.81, -1.51].map((x, index) => (
        <mesh
          key={x}
          geometry={curtainGeometry}
          position={[x, 2.08, -1.52]}
          rotation={[0, index === 0 ? 0.08 : -0.08, 0]}
          castShadow
          receiveShadow
          material={curtainMaterial}
        />
      ))}

      {/* Brass wall sign */}
      <group position={[-0.35, 2.06, -1.69]}>
        <mesh position={[0, 0, 0.012]} castShadow material={trimMaterial}>
          <boxGeometry args={[1.02, 0.24, 0.03]} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[0.9, 0.17]} />
          <meshBasicMaterial map={signTexture} toneMapped={false} />
        </mesh>
      </group>

      {/* Pendant lamp */}
      <group position={[0.42, 0, 0.03]}>
        <mesh position={[0, 2.92, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.76, 12]} />
          <primitive object={blackMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 2.48, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.32, 0.24, 48, 1, true]} />
          <meshStandardMaterial
            color="#2b241d"
            metalness={0.7}
            roughness={0.28}
            side={THREE.DoubleSide}
            envMapIntensity={1.1}
          />
        </mesh>
        <mesh position={[0, 2.36, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.315, 0.012, 12, 56]} />
          <primitive object={brassMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 2.53, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.075, 0.08, 24]} />
          <primitive object={brassMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 2.41, 0]}>
          <sphereGeometry args={[0.06, 28, 22]} />
          <meshBasicMaterial color="#ffdca4" toneMapped={false} />
        </mesh>
        <sprite position={[0, 2.41, 0]} scale={0.85}>
          <spriteMaterial
            map={glowTexture}
            color="#ffb869"
            transparent
            opacity={0.26}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
        <pointLight
          position={[0, 2.4, 0]}
          intensity={12}
          distance={5.5}
          decay={2}
          color="#ffc17a"
        />
      </group>

      {/* Window bounce */}
      <pointLight
        position={[-1.95, 1.85, -1.2]}
        intensity={9}
        distance={5}
        decay={2}
        color="#ffd3a1"
      />

      {/* Plant, softened with a few differently sized leaves */}
      <group position={[-1.72, 0, -0.46]}>
        <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.17, 0.13, 0.38, 32]} />
          <meshStandardMaterial color="#966047" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.385, 0]} receiveShadow>
          <cylinderGeometry args={[0.142, 0.142, 0.02, 32]} />
          <meshStandardMaterial color="#2d2119" roughness={1} />
        </mesh>
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index / 12) * Math.PI * 2 + 0.25;
          const tier = index % 3;
          const height = 0.44 + tier * 0.13;
          const reach = 0.1 + tier * 0.04;
          return (
            <group key={index} rotation={[0, angle, 0]}>
              <mesh position={[0, height - 0.06, 0]} castShadow>
                <cylinderGeometry args={[0.005, 0.008, 0.24, 8]} />
                <meshStandardMaterial color="#405a35" roughness={0.9} />
              </mesh>
              <mesh
                position={[reach, height + 0.04, 0]}
                rotation={[0, 0, -0.62 - tier * 0.1]}
                scale={[0.065 + tier * 0.008, 0.19 + tier * 0.02, 0.026]}
                castShadow
                material={leafMaterial}
              >
                <sphereGeometry args={[1, 16, 10]} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Warm rim from the room */}
      <pointLight
        position={[2.8, 1.8, -0.6]}
        intensity={2.4}
        distance={4.5}
        decay={2}
        color="#b7c8bc"
      />
    </group>
  );
}
