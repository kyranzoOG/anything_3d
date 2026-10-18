export type AppMode = 'edit' | 'paint' | 'animate';

export type TransformTool = 'select' | 'translate' | 'rotate' | 'scale';

export type PaintTool = 'brush' | 'eraser' | 'bucket' | 'picker';

export type FaceDirection = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

export interface FaceUV {
  uv: [number, number, number, number]; // [x1, y1, x2, y2]
  texture: string | null; // texture id or null
  rotation: 0 | 90 | 180 | 270;
  enabled: boolean;
  tint?: string;
  autoUV?: boolean;
}

export interface CubeElement {
  id: string;
  name: string;
  type: 'cube';
  from: [number, number, number]; // [x, y, z] in voxel units
  to: [number, number, number];   // [x, y, z] in voxel units
  origin: [number, number, number]; // pivot point [x, y, z]
  rotation: [number, number, number]; // degrees [x, y, z]
  inflate: number;
  color?: string; // marker color (0-7 or hex)
  visibility: boolean;
  locked: boolean;
  faces: Record<FaceDirection, FaceUV>;
  groupId?: string | null;
}

export interface GroupElement {
  id: string;
  name: string;
  type: 'group';
  origin: [number, number, number]; // pivot point [x, y, z]
  rotation: [number, number, number]; // degrees [x, y, z]
  visibility: boolean;
  locked: boolean;
  isOpen?: boolean;
  parentId?: string | null;
}

export type OutlinerItem = CubeElement | GroupElement;

export interface TextureAsset {
  id: string;
  name: string;
  width: number;
  height: number;
  dataUrl: string;
  canvas?: HTMLCanvasElement;
}

export interface Keyframe {
  time: number; // in seconds
  value: [number, number, number];
  interpolation: 'linear' | 'smooth' | 'step';
}

export interface NodeAnimationData {
  position: Keyframe[];
  rotation: Keyframe[];
  scale: Keyframe[];
}

export interface AnimationClip {
  id: string;
  name: string;
  length: number; // in seconds
  loop: boolean;
  fps: number;
  animators: Record<string, NodeAnimationData>; // key is element/group id
}

export interface ProjectData {
  id: string;
  name: string;
  format: 'generic' | 'bedrock' | 'java_block' | 'skin';
  textureResolution: { width: number; height: number };
  cubes: CubeElement[];
  groups: GroupElement[];
  textures: TextureAsset[];
  animations: AnimationClip[];
}

export interface ViewportSettings {
  displayMode: 'textured' | 'shaded' | 'wireframe' | 'solid';
  showGrid: boolean;
  showAxes: boolean;
  showPivots: boolean;
  showOutlines: boolean;
  cameraFov: number;
  cameraView: 'perspective' | 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
}
