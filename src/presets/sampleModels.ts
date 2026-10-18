import { ProjectData, CubeElement, GroupElement, TextureAsset, FaceDirection, FaceUV } from '../types/model';

// Helper to create default face UV
export function createDefaultFaces(textureId: string | null = null, autoUV = true): Record<FaceDirection, FaceUV> {
  return {
    north: { uv: [0, 0, 16, 16], texture: textureId, rotation: 0, enabled: true, autoUV },
    south: { uv: [0, 0, 16, 16], texture: textureId, rotation: 0, enabled: true, autoUV },
    east:  { uv: [0, 0, 16, 16], texture: textureId, rotation: 0, enabled: true, autoUV },
    west:  { uv: [0, 0, 16, 16], texture: textureId, rotation: 0, enabled: true, autoUV },
    up:    { uv: [0, 0, 16, 16], texture: textureId, rotation: 0, enabled: true, autoUV },
    down:  { uv: [0, 0, 16, 16], texture: textureId, rotation: 0, enabled: true, autoUV },
  };
}

// Generate pixel texture canvas as data URL
export function generateVoxelTexture(type: 'creeper' | 'steve' | 'chest' | 'crafting', width = 64, height = 64): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (type === 'creeper') {
    // Green camouflage background
    ctx.fillStyle = '#4da338';
    ctx.fillRect(0, 0, width, height);

    // Randomize pixel noise
    const colors = ['#388424', '#2d6f1c', '#5cb344', '#72c858', '#255b16'];
    for (let x = 0; x < width; x += 2) {
      for (let y = 0; y < height; y += 2) {
        if (Math.random() > 0.4) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    // Creeper face in top-left region (8x8 pixels at [8, 8])
    ctx.fillStyle = '#111811';
    // Eyes
    ctx.fillRect(10, 12, 3, 3);
    ctx.fillRect(19, 12, 3, 3);
    // Nose and mouth
    ctx.fillRect(14, 15, 4, 6);
    ctx.fillRect(12, 18, 8, 3);
    ctx.fillRect(11, 21, 3, 4);
    ctx.fillRect(18, 21, 3, 4);
  } else if (type === 'steve') {
    ctx.fillStyle = '#5c483a'; // brown hair/shoes
    ctx.fillRect(0, 0, width, height);
    // Skin tone
    ctx.fillStyle = '#d59d7b';
    ctx.fillRect(8, 8, 16, 8); // face
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 12, 2, 2);
    ctx.fillRect(16, 12, 2, 2);
    ctx.fillStyle = '#3c44a9';
    ctx.fillRect(11, 12, 1, 2);
    ctx.fillRect(17, 12, 1, 2);
    // Cyan Shirt
    ctx.fillStyle = '#00a3a3';
    ctx.fillRect(16, 16, 24, 16);
    // Blue Jeans
    ctx.fillStyle = '#263473';
    ctx.fillRect(0, 32, 32, 16);
  } else if (type === 'chest') {
    // Wood chest brown
    ctx.fillStyle = '#a06e3b';
    ctx.fillRect(0, 0, width, height);
    // Planks border
    ctx.fillStyle = '#65421c';
    ctx.strokeRect(0, 0, width, height);
    ctx.lineWidth = 2;
    for (let y = 0; y < height; y += 8) {
      ctx.fillRect(0, y, width, 1);
    }
    // Metal lock
    ctx.fillStyle = '#dcdcdc';
    ctx.fillRect(28, 2, 8, 10);
    ctx.fillStyle = '#333333';
    ctx.fillRect(31, 6, 2, 3);
  } else {
    // Crafting table
    ctx.fillStyle = '#b37c47';
    ctx.fillRect(0, 0, width, height);
    // 3x3 grid pattern on top
    ctx.strokeStyle = '#4a3018';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 5 + 1, 1);
      ctx.lineTo(i * 5 + 1, 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1, i * 5 + 1);
      ctx.lineTo(15, i * 5 + 1);
      ctx.stroke();
    }
  }

  return canvas.toDataURL('image/png');
}

// 1. Creeper Preset
export function createCreeperPreset(): ProjectData {
  const texUrl = generateVoxelTexture('creeper', 64, 64);
  const textureId = 'tex_creeper_1';

  const textures: TextureAsset[] = [
    {
      id: textureId,
      name: 'creeper.png',
      width: 64,
      height: 64,
      dataUrl: texUrl,
    },
  ];

  const headGroup: GroupElement = {
    id: 'grp_head',
    name: 'Head',
    type: 'group',
    origin: [0, 18, 0],
    rotation: [0, 0, 0],
    visibility: true,
    locked: false,
    isOpen: true,
  };

  const bodyGroup: GroupElement = {
    id: 'grp_body',
    name: 'Body',
    type: 'group',
    origin: [0, 12, 0],
    rotation: [0, 0, 0],
    visibility: true,
    locked: false,
    isOpen: true,
  };

  const leg1Group: GroupElement = {
    id: 'grp_leg1',
    name: 'Leg Front Left',
    type: 'group',
    origin: [-2, 6, -4],
    rotation: [0, 0, 0],
    visibility: true,
    locked: false,
  };

  const leg2Group: GroupElement = {
    id: 'grp_leg2',
    name: 'Leg Front Right',
    type: 'group',
    origin: [2, 6, -4],
    rotation: [0, 0, 0],
    visibility: true,
    locked: false,
  };

  const leg3Group: GroupElement = {
    id: 'grp_leg3',
    name: 'Leg Back Left',
    type: 'group',
    origin: [-2, 6, 4],
    rotation: [0, 0, 0],
    visibility: true,
    locked: false,
  };

  const leg4Group: GroupElement = {
    id: 'grp_leg4',
    name: 'Leg Back Right',
    type: 'group',
    origin: [2, 6, 4],
    rotation: [0, 0, 0],
    visibility: true,
    locked: false,
  };

  const cubes: CubeElement[] = [
    {
      id: 'cube_head',
      name: 'head',
      type: 'cube',
      from: [-4, 18, -4],
      to: [4, 26, 4],
      origin: [0, 18, 0],
      rotation: [0, 0, 0],
      inflate: 0,
      color: '#4da338',
      visibility: true,
      locked: false,
      groupId: 'grp_head',
      faces: {
        north: { uv: [8, 8, 16, 16], texture: textureId, rotation: 0, enabled: true },
        south: { uv: [24, 8, 32, 16], texture: textureId, rotation: 0, enabled: true },
        east:  { uv: [0, 8, 8, 16], texture: textureId, rotation: 0, enabled: true },
        west:  { uv: [16, 8, 24, 16], texture: textureId, rotation: 0, enabled: true },
        up:    { uv: [8, 0, 16, 8], texture: textureId, rotation: 0, enabled: true },
        down:  { uv: [16, 0, 24, 8], texture: textureId, rotation: 0, enabled: true },
      },
    },
    {
      id: 'cube_body',
      name: 'body',
      type: 'cube',
      from: [-4, 6, -2],
      to: [4, 18, 2],
      origin: [0, 12, 0],
      rotation: [0, 0, 0],
      inflate: 0,
      color: '#388424',
      visibility: true,
      locked: false,
      groupId: 'grp_body',
      faces: {
        north: { uv: [20, 20, 28, 32], texture: textureId, rotation: 0, enabled: true },
        south: { uv: [32, 20, 40, 32], texture: textureId, rotation: 0, enabled: true },
        east:  { uv: [16, 20, 20, 32], texture: textureId, rotation: 0, enabled: true },
        west:  { uv: [28, 20, 32, 32], texture: textureId, rotation: 0, enabled: true },
        up:    { uv: [20, 16, 28, 20], texture: textureId, rotation: 0, enabled: true },
        down:  { uv: [28, 16, 36, 20], texture: textureId, rotation: 0, enabled: true },
      },
    },
    {
      id: 'cube_leg1',
      name: 'leg_fl',
      type: 'cube',
      from: [-4, 0, -6],
      to: [0, 6, -2],
      origin: [-2, 6, -4],
      rotation: [0, 0, 0],
      inflate: 0,
      color: '#2d6f1c',
      visibility: true,
      locked: false,
      groupId: 'grp_leg1',
      faces: createDefaultFaces(textureId),
    },
    {
      id: 'cube_leg2',
      name: 'leg_fr',
      type: 'cube',
      from: [0, 0, -6],
      to: [4, 6, -2],
      origin: [2, 6, -4],
      rotation: [0, 0, 0],
      inflate: 0,
      color: '#2d6f1c',
      visibility: true,
      locked: false,
      groupId: 'grp_leg2',
      faces: createDefaultFaces(textureId),
    },
    {
      id: 'cube_leg3',
      name: 'leg_bl',
      type: 'cube',
      from: [-4, 0, 2],
      to: [0, 6, 6],
      origin: [-2, 6, 4],
      rotation: [0, 0, 0],
      inflate: 0,
      color: '#2d6f1c',
      visibility: true,
      locked: false,
      groupId: 'grp_leg3',
      faces: createDefaultFaces(textureId),
    },
    {
      id: 'cube_leg4',
      name: 'leg_br',
      type: 'cube',
      from: [0, 0, 2],
      to: [4, 6, 6],
      origin: [2, 6, 4],
      rotation: [0, 0, 0],
      inflate: 0,
      color: '#2d6f1c',
      visibility: true,
      locked: false,
      groupId: 'grp_leg4',
      faces: createDefaultFaces(textureId),
    },
  ];

  // Walking animation
  const walkAnim = {
    id: 'anim_walk',
    name: 'walk',
    length: 1.0,
    loop: true,
    fps: 24,
    animators: {
      grp_leg1: {
        position: [],
        rotation: [
          { time: 0.0, value: [-25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 0.5, value: [25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 1.0, value: [-25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
        ],
        scale: [],
      },
      grp_leg2: {
        position: [],
        rotation: [
          { time: 0.0, value: [25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 0.5, value: [-25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 1.0, value: [25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
        ],
        scale: [],
      },
      grp_leg3: {
        position: [],
        rotation: [
          { time: 0.0, value: [25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 0.5, value: [-25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 1.0, value: [25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
        ],
        scale: [],
      },
      grp_leg4: {
        position: [],
        rotation: [
          { time: 0.0, value: [-25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 0.5, value: [25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 1.0, value: [-25, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
        ],
        scale: [],
      },
      grp_head: {
        position: [],
        rotation: [
          { time: 0.0, value: [0, 8, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 0.5, value: [0, -8, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 1.0, value: [0, 8, 0] as [number, number, number], interpolation: 'smooth' as const },
        ],
        scale: [],
      },
    },
  };

  return {
    id: 'proj_creeper',
    name: 'Creeper',
    format: 'bedrock',
    textureResolution: { width: 64, height: 64 },
    cubes,
    groups: [headGroup, bodyGroup, leg1Group, leg2Group, leg3Group, leg4Group],
    textures,
    animations: [walkAnim],
  };
}

// 2. Chest Preset
export function createChestPreset(): ProjectData {
  const texUrl = generateVoxelTexture('chest', 64, 64);
  const textureId = 'tex_chest_1';

  const textures: TextureAsset[] = [
    {
      id: textureId,
      name: 'chest.png',
      width: 64,
      height: 64,
      dataUrl: texUrl,
    },
  ];

  const lidGroup: GroupElement = {
    id: 'grp_lid',
    name: 'Lid Hinge',
    type: 'group',
    origin: [0, 9, 7],
    rotation: [0, 0, 0],
    visibility: true,
    locked: false,
    isOpen: true,
  };

  const cubes: CubeElement[] = [
    {
      id: 'cube_chest_base',
      name: 'base',
      type: 'cube',
      from: [-7, 0, -7],
      to: [7, 10, 7],
      origin: [0, 5, 0],
      rotation: [0, 0, 0],
      inflate: 0,
      color: '#a06e3b',
      visibility: true,
      locked: false,
      faces: createDefaultFaces(textureId),
    },
    {
      id: 'cube_chest_lid',
      name: 'lid',
      type: 'cube',
      from: [-7, 9, -7],
      to: [7, 14, 7],
      origin: [0, 9, 7],
      rotation: [0, 0, 0],
      inflate: 0,
      color: '#b37c47',
      visibility: true,
      locked: false,
      groupId: 'grp_lid',
      faces: createDefaultFaces(textureId),
    },
    {
      id: 'cube_chest_lock',
      name: 'lock',
      type: 'cube',
      from: [-1, 7, -8],
      to: [1, 11, -7],
      origin: [0, 9, 7],
      rotation: [0, 0, 0],
      inflate: 0,
      color: '#dcdcdc',
      visibility: true,
      locked: false,
      groupId: 'grp_lid',
      faces: createDefaultFaces(textureId),
    },
  ];

  const openAnim = {
    id: 'anim_open',
    name: 'open_chest',
    length: 1.5,
    loop: true,
    fps: 24,
    animators: {
      grp_lid: {
        position: [],
        rotation: [
          { time: 0.0, value: [0, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 0.7, value: [-85, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
          { time: 1.5, value: [0, 0, 0] as [number, number, number], interpolation: 'smooth' as const },
        ],
        scale: [],
      },
    },
  };

  return {
    id: 'proj_chest',
    name: 'Chest',
    format: 'bedrock',
    textureResolution: { width: 64, height: 64 },
    cubes,
    groups: [lidGroup],
    textures,
    animations: [openAnim],
  };
}

// 3. Minecraft Block Preset
export function createBlockPreset(): ProjectData {
  const texUrl = generateVoxelTexture('crafting', 16, 16);
  const textureId = 'tex_crafting_1';

  return {
    id: 'proj_block',
    name: 'Crafting Table',
    format: 'java_block',
    textureResolution: { width: 16, height: 16 },
    cubes: [
      {
        id: 'cube_block_1',
        name: 'crafting_table',
        type: 'cube',
        from: [-8, 0, -8],
        to: [8, 16, 8],
        origin: [0, 8, 0],
        rotation: [0, 0, 0],
        inflate: 0,
        color: '#b37c47',
        visibility: true,
        locked: false,
        faces: createDefaultFaces(textureId),
      },
    ],
    groups: [],
    textures: [
      {
        id: textureId,
        name: 'crafting_table.png',
        width: 16,
        height: 16,
        dataUrl: texUrl,
      },
    ],
    animations: [],
  };
}
