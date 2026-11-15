import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

export type PbrPaths = Partial<
  Record<"color" | "normal" | "roughness" | "metalness" | "ao", string>
>;

const CHANNELS = ["color", "normal", "roughness", "metalness", "ao"] as const;
type Channel = (typeof CHANNELS)[number];

/**
 * Texture clones are shared by cache key. Ten cups all use the same porcelain
 * maps, so this keeps the GPU footprint to one copy instead of ten.
 */
const textureCache = new Map<
  string,
  Partial<Record<Channel, THREE.Texture>>
>();

/**
 * Loads a set of PBR maps and returns independent, correctly tiled clones.
 *
 * Cloning matters because the same source texture is reused by the table,
 * wainscot and shelf at different scales. Mutating the shared texture would
 * make the last component win.
 */
export function usePbrTextures(
  paths: PbrPaths,
  repeat: [number, number] = [1, 1],
  rotation = 0,
): Partial<Record<Channel, THREE.Texture>> {
  const keys = useMemo(
    () => CHANNELS.filter((channel) => Boolean(paths[channel])),
    [paths],
  );
  const urls = useMemo(() => keys.map((key) => paths[key] as string), [keys, paths]);
  const loaded = useTexture(urls) as THREE.Texture[];

  return useMemo(() => {
    const cacheKey = `${urls.join("|")}::${repeat[0]}:${repeat[1]}:${rotation}`;
    const cached = textureCache.get(cacheKey);
    if (cached) return cached;

    const next: Partial<Record<Channel, THREE.Texture>> = {};
    keys.forEach((key, index) => {
      const source = loaded[index];
      if (!source) return;
      const texture = source.clone();
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(repeat[0], repeat[1]);
      texture.rotation = rotation;
      texture.colorSpace =
        key === "color" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
      next[key] = texture;
    });
    textureCache.set(cacheKey, next);
    return next;
  }, [keys, loaded, repeat[0], repeat[1], rotation, urls]);
}
