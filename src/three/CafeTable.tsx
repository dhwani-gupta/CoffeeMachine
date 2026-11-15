import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TABLE_MODEL, TEXTURES } from "./assets";
import { createShadowTexture } from "./textures";
import { usePbrTextures } from "./usePbrTextures";

export const TABLE_TOP_Y = 0.78;
export const MACHINE_POSITION: [number, number, number] = [0.35, TABLE_TOP_Y, -0.04];
export const COASTER_POSITION: [number, number, number] = [
  -0.47,
  TABLE_TOP_Y + 0.014,
  0.38,
];
export const TRAY_CUP_POSITION: [number, number, number] = [
  MACHINE_POSITION[0],
  TABLE_TOP_Y + 0.075,
  MACHINE_POSITION[2] + 0.43,
];

const TABLE_SCALE: [number, number, number] = [1.55, 1.42, 2.05];

function WoodenTable() {
  const { scene } = useGLTF(TABLE_MODEL);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      const next = materials.map((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return material;
        const copy = material.clone();
        copy.side = THREE.FrontSide;
        copy.envMapIntensity = 0.9;
        copy.normalScale.set(0.7, 0.7);
        copy.roughness = 1;
        copy.metalness = 1;
        copy.dithering = true;
        copy.map && (copy.map.anisotropy = 8);
        copy.normalMap && (copy.normalMap.anisotropy = 8);
        copy.roughnessMap && (copy.roughnessMap.anisotropy = 8);
        return copy;
      });
      child.material = Array.isArray(child.material) ? next : next[0];
    });
    return clone;
  }, [scene]);

  return (
    <primitive
      object={model}
      scale={TABLE_SCALE}
      position={[0, 0, 0]}
      castShadow
      receiveShadow
    />
  );
}

export function CafeTable() {
  const shadowTexture = useMemo(createShadowTexture, []);
  const cork = usePbrTextures(TEXTURES.cork, [1, 1]);
  const wood = usePbrTextures(TEXTURES.wood, [1, 1]);
  const metal = usePbrTextures(TEXTURES.metal, [1.4, 1]);

  const steelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: metal.color,
        normalMap: metal.normal,
        roughnessMap: metal.roughness,
        metalnessMap: metal.metalness,
        color: "#c1c9cc",
        metalness: 1,
        roughness: 0.55,
        envMapIntensity: 1.1,
      }),
    [metal],
  );

  const brassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b98a4f",
        metalness: 1,
        roughness: 0.26,
        envMapIntensity: 1.35,
      }),
    [],
  );

  const corkMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: cork.color,
        normalMap: cork.normal,
        roughnessMap: cork.roughness,
        aoMap: cork.ao,
        color: "#c9a57f",
        roughness: 1,
        metalness: 0,
        normalScale: new THREE.Vector2(0.8, 0.8),
        envMapIntensity: 0.5,
      }),
    [cork],
  );

  const handleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: wood.color,
        normalMap: wood.normal,
        roughnessMap: wood.roughness,
        color: "#7a4b2d",
        roughness: 0.58,
        metalness: 0.02,
        envMapIntensity: 0.7,
      }),
    [wood],
  );

  const waterMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#d7e6e2",
        roughness: 0.06,
        metalness: 0,
        transmission: 0.86,
        thickness: 0.025,
        ior: 1.33,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      }),
    [],
  );

  return (
    <group>
      {/* A quiet pool of shade below the table. Real shadows still do the work. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.0025, 0.08]}
        receiveShadow
      >
        <planeGeometry args={[3.35, 1.65]} />
        <meshBasicMaterial
          map={shadowTexture}
          transparent
          opacity={0.45}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <WoodenTable />

      {/* Contact shade under the machine. It keeps the heavy machine from looking pasted on. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0.35, TABLE_TOP_Y + 0.0025, -0.01]}
      >
        <planeGeometry args={[1.24, 0.76]} />
        <meshBasicMaterial
          map={shadowTexture}
          transparent
          opacity={0.52}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Cork coaster with a brass keeper ring */}
      <group position={COASTER_POSITION}>
        <mesh position={[0, -0.006, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[0.098, 0.1, 0.012, 56]} />
          <primitive object={corkMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.083, 0.089, 56]} />
          <primitive object={brassMaterial} attach="material" />
        </mesh>
      </group>

      {/* Tamper, with a walnut handle */}
      <group position={[1.14, TABLE_TOP_Y, 0.12]} rotation={[0, 0.18, 0]}>
        <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.047, 0.05, 0.024, 40]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.013, 0.014, 0.038, 24]} />
          <primitive object={brassMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.084, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.02, 0.08, 24]} />
          <primitive object={handleMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.135, 0]} castShadow>
          <sphereGeometry args={[0.025, 28, 20]} />
          <primitive object={handleMaterial} attach="material" />
        </mesh>
      </group>

      {/* Water glass */}
      <group position={[1.14, TABLE_TOP_Y, 0.39]}>
        <mesh position={[0, 0.058, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.031, 0.116, 40, 1, true]} />
          <primitive object={waterMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.043, 0]}>
          <cylinderGeometry args={[0.03, 0.028, 0.072, 40]} />
          <meshPhysicalMaterial
            color="#b8d3ce"
            roughness={0.08}
            transparent
            opacity={0.48}
            transmission={0.5}
            thickness={0.02}
            ior={1.33}
          />
        </mesh>
        <mesh position={[0, 0.116, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.031, 0.035, 40]} />
          <meshPhysicalMaterial
            color="#e8f2ef"
            roughness={0.05}
            metalness={0.05}
            transparent
            opacity={0.68}
          />
        </mesh>
      </group>

      {/* Folded linen napkin */}
      <group position={[-0.94, TABLE_TOP_Y + 0.004, 0.16]} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.005, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.31, 0.01, 0.22]} />
          <meshStandardMaterial color="#b9a98f" roughness={0.96} />
        </mesh>
        <mesh position={[0.025, 0.012, 0.012]} rotation={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.2, 0.007, 0.16]} />
          <meshStandardMaterial color="#cebea1" roughness={0.94} />
        </mesh>
      </group>

      {/* A demitasse spoon resting beside the coaster */}
      <group position={[-0.2, TABLE_TOP_Y + 0.008, 0.46]} rotation={[0, 0.65, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.115, 0.005, 0.014]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        <mesh position={[0.073, 0, 0]} castShadow>
          <sphereGeometry args={[0.025, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload(TABLE_MODEL);
