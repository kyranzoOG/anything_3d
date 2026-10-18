import { ProjectData, CubeElement, GroupElement, TextureAsset, FaceDirection } from '../types/model';
import { createDefaultFaces } from '../presets/sampleModels';

// Export Project as Blockbench .bbmodel JSON
export function exportBBModel(project: ProjectData): string {
  const outliner = project.groups.map(group => {
    const groupCubes = project.cubes
      .filter(c => c.groupId === group.id)
      .map(c => c.id);
    return {
      name: group.name,
      origin: group.origin,
      rotation: group.rotation,
      color: 0,
      uuid: group.id,
      export: group.visibility,
      isOpen: group.isOpen ?? true,
      locked: group.locked,
      visibility: group.visibility,
      children: groupCubes,
    };
  });

  // Top-level unassigned cubes
  const unassignedCubes = project.cubes
    .filter(c => !c.groupId)
    .map(c => c.id);

  const bbmodelObj = {
    meta: {
      format_version: '4.10',
      creation_time: Math.floor(Date.now() / 1000),
      model_format: project.format,
      box_uv: false,
    },
    name: project.name,
    model_identifier: project.name.toLowerCase().replace(/\s+/g, '_'),
    resolution: project.textureResolution,
    elements: project.cubes.map(cube => ({
      name: cube.name,
      box_uv: false,
      type: 'cube',
      uuid: cube.id,
      from: cube.from,
      to: cube.to,
      origin: cube.origin,
      rotation: cube.rotation,
      inflate: cube.inflate,
      color: cube.color ? parseInt(cube.color.replace('#', ''), 16) : 0,
      visibility: cube.visibility,
      locked: cube.locked,
      faces: cube.faces,
    })),
    outliner: [...outliner, ...unassignedCubes],
    textures: project.textures.map((tex, index) => ({
      name: tex.name,
      folder: 'block',
      namespace: '',
      id: tex.id,
      particle: index === 0,
      render_mode: 'default',
      width: tex.width,
      height: tex.height,
      source: tex.dataUrl,
      uuid: tex.id,
    })),
    animations: project.animations.map(anim => ({
      uuid: anim.id,
      name: anim.name,
      loop: anim.loop ? 'loop' : 'once',
      length: anim.length,
      fps: anim.fps,
      animators: anim.animators,
    })),
  };

  return JSON.stringify(bbmodelObj, null, 2);
}

// Export Project as Minecraft Java Block Model JSON
export function exportJavaBlockModel(project: ProjectData): string {
  const texturesObj: Record<string, string> = {};
  project.textures.forEach((tex, idx) => {
    texturesObj[idx.toString()] = `block/${tex.name.replace(/\.[^/.]+$/, '')}`;
  });
  if (project.textures.length > 0) {
    texturesObj['particle'] = texturesObj['0'];
  }

  const elements = project.cubes.map(cube => {
    // Java block coordinates are 0-16 in voxel space, offset from center
    const from = [cube.from[0] + 8, cube.from[1], cube.from[2] + 8];
    const to = [cube.to[0] + 8, cube.to[1], cube.to[2] + 8];

    const faces: Record<string, any> = {};
    const directions: FaceDirection[] = ['north', 'south', 'east', 'west', 'up', 'down'];

    directions.forEach(dir => {
      const face = cube.faces[dir];
      if (face && face.enabled) {
        faces[dir] = {
          uv: face.uv,
          texture: '#0',
          rotation: face.rotation,
        };
      }
    });

    const elemObj: any = {
      name: cube.name,
      from,
      to,
      faces,
    };

    if (cube.rotation[0] !== 0 || cube.rotation[1] !== 0 || cube.rotation[2] !== 0) {
      // Find primary rotation axis
      let axis = 'y';
      let angle = cube.rotation[1];
      if (Math.abs(cube.rotation[0]) > 0.01) {
        axis = 'x';
        angle = cube.rotation[0];
      } else if (Math.abs(cube.rotation[2]) > 0.01) {
        axis = 'z';
        angle = cube.rotation[2];
      }
      elemObj.rotation = {
        origin: [cube.origin[0] + 8, cube.origin[1], cube.origin[2] + 8],
        axis,
        angle,
      };
    }

    return elemObj;
  });

  const javaObj = {
    credit: 'Made with Blockbench in React',
    texture_size: [project.textureResolution.width, project.textureResolution.height],
    textures: texturesObj,
    elements,
  };

  return JSON.stringify(javaObj, null, 2);
}

// Export Wavefront OBJ
export function exportWavefrontOBJ(project: ProjectData): string {
  let output = `# Blockbench Wavefront OBJ Export\n# Model: ${project.name}\n\n`;
  let vertexOffset = 1;
  let uvOffset = 1;

  project.cubes.forEach(cube => {
    if (!cube.visibility) return;
    output += `o ${cube.name.replace(/\s+/g, '_')}\n`;

    const [x1, y1, z1] = cube.from;
    const [x2, y2, z2] = cube.to;

    // 8 vertices for the cube
    const vertices = [
      [x1, y1, z1],
      [x2, y1, z1],
      [x2, y2, z1],
      [x1, y2, z1],
      [x1, y1, z2],
      [x2, y1, z2],
      [x2, y2, z2],
      [x1, y2, z2],
    ];

    vertices.forEach(v => {
      output += `v ${v[0].toFixed(4)} ${v[1].toFixed(4)} ${v[2].toFixed(4)}\n`;
    });

    // Face UVs
    const faces = [
      { name: 'north', idxs: [4, 3, 2, 1], uv: cube.faces.north.uv },
      { name: 'south', idxs: [5, 6, 7, 8], uv: cube.faces.south.uv },
      { name: 'east',  idxs: [2, 3, 7, 6], uv: cube.faces.east.uv },
      { name: 'west',  idxs: [5, 8, 4, 1], uv: cube.faces.west.uv },
      { name: 'up',    idxs: [4, 8, 7, 3], uv: cube.faces.up.uv },
      { name: 'down',  idxs: [1, 2, 6, 5], uv: cube.faces.down.uv },
    ];

    faces.forEach(f => {
      const u1 = f.uv[0] / project.textureResolution.width;
      const v1 = 1.0 - (f.uv[1] / project.textureResolution.height);
      const u2 = f.uv[2] / project.textureResolution.width;
      const v2 = 1.0 - (f.uv[3] / project.textureResolution.height);

      output += `vt ${u1.toFixed(4)} ${v1.toFixed(4)}\n`;
      output += `vt ${u2.toFixed(4)} ${v1.toFixed(4)}\n`;
      output += `vt ${u2.toFixed(4)} ${v2.toFixed(4)}\n`;
      output += `vt ${u1.toFixed(4)} ${v2.toFixed(4)}\n`;

      const vo = vertexOffset;
      const uo = uvOffset;
      output += `f ${f.idxs[0] + vo - 1}/${uo} ${f.idxs[1] + vo - 1}/${uo + 1} ${f.idxs[2] + vo - 1}/${uo + 2} ${f.idxs[3] + vo - 1}/${uo + 3}\n`;

      uvOffset += 4;
    });

    vertexOffset += 8;
    output += '\n';
  });

  return output;
}

// Import BBModel or JSON string into ProjectData
export function importProject(jsonString: string): ProjectData {
  const data = JSON.parse(jsonString);

  if (data.meta && data.elements) {
    // BBModel format
    const cubes: CubeElement[] = data.elements.map((el: any) => ({
      id: el.uuid || `cube_${Math.random().toString(36).substring(2, 9)}`,
      name: el.name || 'cube',
      type: 'cube',
      from: el.from || [0, 0, 0],
      to: el.to || [16, 16, 16],
      origin: el.origin || [0, 0, 0],
      rotation: el.rotation || [0, 0, 0],
      inflate: el.inflate || 0,
      color: el.color ? `#${el.color.toString(16).padStart(6, '0')}` : undefined,
      visibility: el.visibility !== false,
      locked: !!el.locked,
      faces: el.faces || createDefaultFaces(),
      groupId: null,
    }));

    const groups: GroupElement[] = [];
    if (Array.isArray(data.outliner)) {
      data.outliner.forEach((item: any) => {
        if (typeof item === 'object' && item.name) {
          const groupId = item.uuid || `grp_${Math.random().toString(36).substring(2, 9)}`;
          groups.push({
            id: groupId,
            name: item.name,
            type: 'group',
            origin: item.origin || [0, 0, 0],
            rotation: item.rotation || [0, 0, 0],
            visibility: item.visibility !== false,
            locked: !!item.locked,
            isOpen: item.isOpen !== false,
          });

          // Assign child cubes
          if (Array.isArray(item.children)) {
            item.children.forEach((childId: string) => {
              const matchedCube = cubes.find(c => c.id === childId);
              if (matchedCube) matchedCube.groupId = groupId;
            });
          }
        }
      });
    }

    const textures: TextureAsset[] = (data.textures || []).map((tex: any) => ({
      id: tex.uuid || tex.id || `tex_${Math.random().toString(36).substring(2, 9)}`,
      name: tex.name || 'texture.png',
      width: tex.width || 64,
      height: tex.height || 64,
      dataUrl: tex.source || '',
    }));

    const animations = (data.animations || []).map((anim: any) => ({
      id: anim.uuid || `anim_${Math.random().toString(36).substring(2, 9)}`,
      name: anim.name || 'animation',
      length: anim.length || 1.0,
      loop: anim.loop === 'loop' || anim.loop === true,
      fps: anim.fps || 24,
      animators: anim.animators || {},
    }));

    return {
      id: `proj_${Date.now()}`,
      name: data.name || 'Imported Model',
      format: data.meta.model_format || 'bedrock',
      textureResolution: data.resolution || { width: 64, height: 64 },
      cubes,
      groups,
      textures,
      animations,
    };
  }

  // Fallback for simple Minecraft Block JSON
  if (data.elements) {
    const cubes: CubeElement[] = data.elements.map((el: any, idx: number) => ({
      id: `cube_${idx}`,
      name: el.name || `cube_${idx}`,
      type: 'cube',
      from: [(el.from?.[0] ?? 8) - 8, el.from?.[1] ?? 0, (el.from?.[2] ?? 8) - 8],
      to: [(el.to?.[0] ?? 24) - 8, el.to?.[1] ?? 16, (el.to?.[2] ?? 24) - 8],
      origin: el.rotation?.origin ? [el.rotation.origin[0] - 8, el.rotation.origin[1], el.rotation.origin[2] - 8] : [0, 0, 0],
      rotation: [
        el.rotation?.axis === 'x' ? el.rotation.angle : 0,
        el.rotation?.axis === 'y' ? el.rotation.angle : 0,
        el.rotation?.axis === 'z' ? el.rotation.angle : 0,
      ],
      inflate: 0,
      visibility: true,
      locked: false,
      faces: el.faces || createDefaultFaces(),
    }));

    return {
      id: `proj_${Date.now()}`,
      name: 'Imported Block',
      format: 'java_block',
      textureResolution: { width: 16, height: 16 },
      cubes,
      groups: [],
      textures: [],
      animations: [],
    };
  }

  throw new Error('Unsupported JSON file format');
}

// Download file utility
export function downloadFile(filename: string, content: string, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
