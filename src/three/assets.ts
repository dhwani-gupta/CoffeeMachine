/**
 * Local, licence-clear assets. Keeping the paths in one place makes it easier
 * to swap a material without hunting through the scene graph.
 *
 * Sources and licences are documented in ASSETS.md.
 */
export const CAFE_HDRI = "/hdri/comfy_cafe_1k.hdr";

export const TABLE_MODEL = "/models/wooden-table/WoodenTable_01.gltf";

export const TEXTURES = {
  wood: {
    color: "/textures/wood/Wood051_1K-JPG_Color.jpg",
    normal: "/textures/wood/Wood051_1K-JPG_NormalGL.jpg",
    roughness: "/textures/wood/Wood051_1K-JPG_Roughness.jpg",
  },
  floor: {
    color: "/textures/floor/WoodFloor064_1K-JPG_Color.jpg",
    normal: "/textures/floor/WoodFloor064_1K-JPG_NormalGL.jpg",
    roughness: "/textures/floor/WoodFloor064_1K-JPG_Roughness.jpg",
  },
  metal: {
    color: "/textures/metal/Metal009_1K-JPG_Color.jpg",
    normal: "/textures/metal/Metal009_1K-JPG_NormalGL.jpg",
    roughness: "/textures/metal/Metal009_1K-JPG_Roughness.jpg",
    metalness: "/textures/metal/Metal009_1K-JPG_Metalness.jpg",
  },
  plaster: {
    color: "/textures/plaster/PaintedPlaster017_1K-JPG_Color.jpg",
    normal: "/textures/plaster/PaintedPlaster017_1K-JPG_NormalGL.jpg",
    roughness: "/textures/plaster/PaintedPlaster017_1K-JPG_Roughness.jpg",
  },
  porcelain: {
    normal: "/textures/porcelain/Porcelain001_1K-JPG_NormalGL.jpg",
    roughness: "/textures/porcelain/Porcelain001_1K-JPG_Roughness.jpg",
  },
  cork: {
    color: "/textures/cork/Cork001_1K-JPG_Color.jpg",
    normal: "/textures/cork/Cork001_1K-JPG_NormalGL.jpg",
    roughness: "/textures/cork/Cork001_1K-JPG_Roughness.jpg",
    ao: "/textures/cork/Cork001_1K-JPG_AmbientOcclusion.jpg",
  },
} as const;
