import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useProject } from '../../context/ProjectContext';
import { CubeElement, FaceDirection } from '../../types/model';
import {
  Maximize2,
  Minimize2,
  Grid,
  Compass,
  RotateCcw,
  Camera,
  Sun,
  Eye,
  Move,
  RotateCw,
  Scaling,
  MousePointer,
} from 'lucide-react';

export const ThreeViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    project,
    mode,
    activeTool,
    setActiveTool,
    paintTool,
    brushSize,
    paintColor,
    selectedElementIds,
    selectElement,
    selectedFace,
    setSelectedFace,
    viewportSettings,
    setViewportSettings,
    updateCube,
    updateGroup,
    paintPixelOnTexture,
    activeTextureId,
    playheadTime,
    isPlaying,
  } = useProject();

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const gizmoGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Texture cache for Three.js
  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());

  // Camera Orbit State
  const orbitState = useRef({
    isOrbiting: false,
    isPanning: false,
    isDraggingGizmo: false,
    activeGizmoAxis: null as 'x' | 'y' | 'z' | null,
    startX: 0,
    startY: 0,
    rotX: 0.45,
    rotY: -0.65,
    distance: 48,
    target: new THREE.Vector3(0, 10, 0),
  });

  const [activeGizmoAxisState, setActiveGizmoAxisState] = useState<'x' | 'y' | 'z' | null>(null);

  // Initialize Scene, Camera, Renderer
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181a1f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight1.position.set(20, 40, 25);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x708090, 0.35);
    dirLight2.position.set(-20, 20, -20);
    scene.add(dirLight2);

    // Ground Grid (16x16 voxels, Minecraft style)
    const gridHelper = new THREE.GridHelper(32, 32, 0x3e4451, 0x282c34);
    gridHelper.position.y = 0;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Cubes & Bones container
    const meshesGroup = new THREE.Group();
    scene.add(meshesGroup);
    meshesGroupRef.current = meshesGroup;

    // Gizmo container
    const gizmoGroup = new THREE.Group();
    scene.add(gizmoGroup);
    gizmoGroupRef.current = gizmoGroup;

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Render loop
    let animId: number;
    const render = () => {
      // Update camera position from orbit spherical coordinates
      const { rotX, rotY, distance, target } = orbitState.current;
      const cx = target.x + distance * Math.cos(rotX) * Math.sin(rotY);
      const cy = target.y + distance * Math.sin(rotX);
      const cz = target.z + distance * Math.cos(rotX) * Math.cos(rotY);
      camera.position.set(cx, cy, cz);
      camera.lookAt(target);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update Three.js textures when project.textures change
  useEffect(() => {
    project.textures.forEach(tex => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let threeTex = textureCacheRef.current.get(tex.id);
        if (!threeTex) {
          threeTex = new THREE.Texture(img);
          threeTex.magFilter = THREE.NearestFilter;
          threeTex.minFilter = THREE.NearestFilter;
          threeTex.needsUpdate = true;
          textureCacheRef.current.set(tex.id, threeTex);
        } else {
          threeTex.image = img;
          threeTex.needsUpdate = true;
        }
      };
      img.src = tex.dataUrl;
    });
  }, [project.textures]);

  // Compute animated transforms for bones/cubes
  const getInterpolatedTransform = useCallback(
    (nodeId: string, basePos: [number, number, number], baseRot: [number, number, number]) => {
      if (mode !== 'animate' || !project.animations.length) {
        return { pos: basePos, rot: baseRot, scale: [1, 1, 1] as [number, number, number] };
      }

      const activeAnim = project.animations[0]; // active animation
      if (!activeAnim || !activeAnim.animators[nodeId]) {
        return { pos: basePos, rot: baseRot, scale: [1, 1, 1] as [number, number, number] };
      }

      const animData = activeAnim.animators[nodeId];
      let animRot = [...baseRot];
      let animPos = [...basePos];

      // Interpolate rotation
      if (animData.rotation && animData.rotation.length > 0) {
        const sorted = animData.rotation;
        if (playheadTime <= sorted[0].time) {
          animRot = sorted[0].value.map((v, i) => v + baseRot[i]);
        } else if (playheadTime >= sorted[sorted.length - 1].time) {
          animRot = sorted[sorted.length - 1].value.map((v, i) => v + baseRot[i]);
        } else {
          for (let i = 0; i < sorted.length - 1; i++) {
            if (playheadTime >= sorted[i].time && playheadTime <= sorted[i + 1].time) {
              const t = (playheadTime - sorted[i].time) / (sorted[i + 1].time - sorted[i].time);
              animRot = [
                baseRot[0] + sorted[i].value[0] + (sorted[i + 1].value[0] - sorted[i].value[0]) * t,
                baseRot[1] + sorted[i].value[1] + (sorted[i + 1].value[1] - sorted[i].value[1]) * t,
                baseRot[2] + sorted[i].value[2] + (sorted[i + 1].value[2] - sorted[i].value[2]) * t,
              ];
              break;
            }
          }
        }
      }

      return {
        pos: animPos as [number, number, number],
        rot: animRot as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
      };
    },
    [mode, project.animations, playheadTime]
  );

  // Build Three.js 3D Meshes from project cubes and groups
  useEffect(() => {
    const meshesGroup = meshesGroupRef.current;
    if (!meshesGroup) return;

    // Clear previous children
    while (meshesGroup.children.length > 0) {
      const child = meshesGroup.children[0];
      meshesGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    }

    // Map of group hierarchy nodes
    const groupNodes = new Map<string, THREE.Group>();

    project.groups.forEach(group => {
      const g = new THREE.Group();
      g.name = group.id;
      g.position.set(group.origin[0], group.origin[1], group.origin[2]);

      const animated = getInterpolatedTransform(group.id, [0, 0, 0], group.rotation);
      g.rotation.set(
        THREE.MathUtils.degToRad(animated.rot[0]),
        THREE.MathUtils.degToRad(animated.rot[1]),
        THREE.MathUtils.degToRad(animated.rot[2])
      );
      g.visible = group.visibility;
      groupNodes.set(group.id, g);
      meshesGroup.add(g);
    });

    // Build cubes
    project.cubes.forEach(cube => {
      if (!cube.visibility) return;

      const width = Math.max(0.1, cube.to[0] - cube.from[0]);
      const height = Math.max(0.1, cube.to[1] - cube.from[1]);
      const depth = Math.max(0.1, cube.to[2] - cube.from[2]);

      const geometry = new THREE.BoxGeometry(width, height, depth);

      // Map UVs for each face
      // Three.js BoxGeometry material order: [right(east), left(west), top(up), bottom(down), front(south), back(north)]
      const faceDirections: FaceDirection[] = ['east', 'west', 'up', 'down', 'south', 'north'];
      const materials: THREE.Material[] = [];

      const uvAttr = geometry.attributes.uv;
      const resW = project.textureResolution.width || 64;
      const resH = project.textureResolution.height || 64;

      faceDirections.forEach((dir, faceIdx) => {
        const faceData = cube.faces[dir];
        const tex = faceData?.texture
          ? textureCacheRef.current.get(faceData.texture)
          : textureCacheRef.current.get(activeTextureId || '');

        let mat: THREE.Material;
        const isSelected = selectedElementIds.includes(cube.id);

        if (viewportSettings.displayMode === 'wireframe') {
          mat = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: isSelected ? 0x3b82f6 : 0x888888,
          });
        } else if (viewportSettings.displayMode === 'solid') {
          mat = new THREE.MeshLambertMaterial({
            color: cube.color ? new THREE.Color(cube.color) : 0xcccccc,
          });
        } else {
          // Textured or Shaded
          if (tex) {
            mat = new THREE.MeshLambertMaterial({
              map: tex,
              transparent: true,
              alphaTest: 0.1,
            });
          } else {
            mat = new THREE.MeshLambertMaterial({
              color: cube.color ? new THREE.Color(cube.color) : 0x72c858,
            });
          }
        }

        materials.push(mat);

        // Adjust UV mapping coordinates on geometry
        if (faceData && faceData.uv) {
          const [u1, v1, u2, v2] = faceData.uv;
          const left = u1 / resW;
          const right = u2 / resW;
          const top = 1 - v1 / resH;
          const bottom = 1 - v2 / resH;

          // 4 vertices per face (2 triangles)
          const vertexOffset = faceIdx * 4;
          uvAttr.setXY(vertexOffset + 0, left, top);
          uvAttr.setXY(vertexOffset + 1, right, top);
          uvAttr.setXY(vertexOffset + 2, left, bottom);
          uvAttr.setXY(vertexOffset + 3, right, bottom);
        }
      });

      uvAttr.needsUpdate = true;

      const mesh = new THREE.Mesh(geometry, materials);
      mesh.name = cube.id;
      mesh.userData = { cubeId: cube.id, type: 'cube' };
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Selection outline box
      if (selectedElementIds.includes(cube.id) && viewportSettings.showOutlines) {
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
        );
        mesh.add(line);
      }

      // Position relative to its origin/pivot
      const centerX = (cube.from[0] + cube.to[0]) / 2;
      const centerY = (cube.from[1] + cube.to[1]) / 2;
      const centerZ = (cube.from[2] + cube.to[2]) / 2;

      // If cube has its own origin & rotation
      const pivotGroup = new THREE.Group();
      pivotGroup.position.set(cube.origin[0], cube.origin[1], cube.origin[2]);
      pivotGroup.rotation.set(
        THREE.MathUtils.degToRad(cube.rotation[0]),
        THREE.MathUtils.degToRad(cube.rotation[1]),
        THREE.MathUtils.degToRad(cube.rotation[2])
      );

      mesh.position.set(centerX - cube.origin[0], centerY - cube.origin[1], centerZ - cube.origin[2]);
      pivotGroup.add(mesh);

      if (cube.groupId && groupNodes.has(cube.groupId)) {
        const parentGroup = groupNodes.get(cube.groupId)!;
        parentGroup.add(pivotGroup);
      } else {
        meshesGroup.add(pivotGroup);
      }
    });

    // Update Transform Gizmo
    const gizmoGroup = gizmoGroupRef.current;
    if (gizmoGroup) {
      while (gizmoGroup.children.length > 0) {
        gizmoGroup.remove(gizmoGroup.children[0]);
      }

      if (selectedElementIds.length > 0 && activeTool !== 'select') {
        const activeCube = project.cubes.find(c => c.id === selectedElementIds[0]);
        if (activeCube) {
          const origin = activeCube.origin;
          gizmoGroup.position.set(origin[0], origin[1], origin[2]);

          // Create 3D Arrow Handles for Translate / Scale
          const arrowLen = 6;
          // X Arrow (Red)
          const dirX = new THREE.Vector3(1, 0, 0);
          const arrowX = new THREE.ArrowHelper(dirX, new THREE.Vector3(0, 0, 0), arrowLen, 0xef4444, 1.5, 0.8);
          arrowX.name = 'gizmo_x';
          gizmoGroup.add(arrowX);

          // Y Arrow (Green)
          const dirY = new THREE.Vector3(0, 1, 0);
          const arrowY = new THREE.ArrowHelper(dirY, new THREE.Vector3(0, 0, 0), arrowLen, 0x22c55e, 1.5, 0.8);
          arrowY.name = 'gizmo_y';
          gizmoGroup.add(arrowY);

          // Z Arrow (Blue)
          const dirZ = new THREE.Vector3(0, 0, 1);
          const arrowZ = new THREE.ArrowHelper(dirZ, new THREE.Vector3(0, 0, 0), arrowLen, 0x3b82f6, 1.5, 0.8);
          arrowZ.name = 'gizmo_z';
          gizmoGroup.add(arrowZ);

          // Center sphere pivot
          const pivotGeo = new THREE.SphereGeometry(0.5, 8, 8);
          const pivotMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
          const pivotMesh = new THREE.Mesh(pivotGeo, pivotMat);
          gizmoGroup.add(pivotMesh);
        }
      }
    }
  }, [
    project.cubes,
    project.groups,
    selectedElementIds,
    viewportSettings,
    activeTool,
    activeTextureId,
    getInterpolatedTransform,
  ]);

  // Update Grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = viewportSettings.showGrid;
    }
  }, [viewportSettings.showGrid]);

  // Mouse Interaction: Orbit, Pan, Zoom, Gizmo Drag, Cube Click, Face Painting
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const isRightClick = e.button === 2;
    const isMiddleClick = e.button === 1;
    const isShiftClick = e.shiftKey;

    orbitState.current.startX = e.clientX;
    orbitState.current.startY = e.clientY;

    if (isRightClick || isMiddleClick || isShiftClick) {
      orbitState.current.isPanning = true;
      return;
    }

    // Raycast to check for Gizmo or Cube click
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    raycasterRef.current.setFromCamera(mouse, cameraRef.current);

    // 1. Check Gizmo interaction
    if (gizmoGroupRef.current && activeTool !== 'select') {
      const gizmoIntersects = raycasterRef.current.intersectObjects(gizmoGroupRef.current.children, true);
      if (gizmoIntersects.length > 0) {
        let hitName = gizmoIntersects[0].object.name;
        if (!hitName && gizmoIntersects[0].object.parent) {
          hitName = gizmoIntersects[0].object.parent.name;
        }

        let axis: 'x' | 'y' | 'z' | null = null;
        if (hitName.includes('x')) axis = 'x';
        else if (hitName.includes('y')) axis = 'y';
        else if (hitName.includes('z')) axis = 'z';

        if (axis) {
          orbitState.current.isDraggingGizmo = true;
          orbitState.current.activeGizmoAxis = axis;
          setActiveGizmoAxisState(axis);
          return;
        }
      }
    }

    // 2. Check Cube interaction
    if (meshesGroupRef.current) {
      const intersects = raycasterRef.current.intersectObjects(meshesGroupRef.current.children, true);
      if (intersects.length > 0) {
        const hit = intersects[0];
        let cubeId: string | null = null;
        let curr: THREE.Object3D | null = hit.object;

        while (curr && !cubeId) {
          if (curr.userData && curr.userData.cubeId) {
            cubeId = curr.userData.cubeId;
          }
          curr = curr.parent;
        }

        if (cubeId) {
          selectElement(cubeId, e.ctrlKey || e.metaKey);

          // In paint mode, paint directly on face!
          if (mode === 'paint' && hit.uv && activeTextureId) {
            const hitCube = project.cubes.find(c => c.id === cubeId);
            if (hitCube) {
              const resW = project.textureResolution.width;
              const resH = project.textureResolution.height;
              const px = Math.floor(hit.uv.x * resW);
              const py = Math.floor((1 - hit.uv.y) * resH);

              const color = paintTool === 'eraser' ? 'transparent' : paintColor;
              paintPixelOnTexture(activeTextureId, px, py, color);
            }
          }
          return;
        }
      }
    }

    // Otherwise start Orbiting
    orbitState.current.isOrbiting = true;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const dx = e.clientX - orbitState.current.startX;
    const dy = e.clientY - orbitState.current.startY;
    orbitState.current.startX = e.clientX;
    orbitState.current.startY = e.clientY;

    // Gizmo Dragging
    if (orbitState.current.isDraggingGizmo && orbitState.current.activeGizmoAxis) {
      const axis = orbitState.current.activeGizmoAxis;
      const sensitivity = 0.15;
      const moveDelta = (dx - dy) * sensitivity;

      if (selectedElementIds.length > 0) {
        const activeCube = project.cubes.find(c => c.id === selectedElementIds[0]);
        if (activeCube) {
          if (activeTool === 'translate') {
            const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
            const newFrom = [...activeCube.from] as [number, number, number];
            const newTo = [...activeCube.to] as [number, number, number];
            const newOrigin = [...activeCube.origin] as [number, number, number];

            newFrom[axisIdx] = Math.round((newFrom[axisIdx] + moveDelta) * 2) / 2;
            newTo[axisIdx] = Math.round((newTo[axisIdx] + moveDelta) * 2) / 2;
            newOrigin[axisIdx] = Math.round((newOrigin[axisIdx] + moveDelta) * 2) / 2;

            updateCube(activeCube.id, { from: newFrom, to: newTo, origin: newOrigin });
          } else if (activeTool === 'rotate') {
            const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
            const newRot = [...activeCube.rotation] as [number, number, number];
            newRot[axisIdx] = Math.round((newRot[axisIdx] + moveDelta * 4) / 5) * 5;
            updateCube(activeCube.id, { rotation: newRot });
          } else if (activeTool === 'scale') {
            const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
            const newTo = [...activeCube.to] as [number, number, number];
            newTo[axisIdx] = Math.max(newTo[axisIdx] + moveDelta, activeCube.from[axisIdx] + 0.5);
            updateCube(activeCube.id, { to: newTo });
          }
        }
      }
      return;
    }

    // Camera Panning
    if (orbitState.current.isPanning) {
      const panSpeed = 0.05 * (orbitState.current.distance / 40);
      const { rotY } = orbitState.current;
      const forwardX = -Math.sin(rotY);
      const forwardZ = -Math.cos(rotY);
      const rightX = Math.cos(rotY);
      const rightZ = -Math.sin(rotY);

      orbitState.current.target.x -= (rightX * dx - forwardX * 0) * panSpeed;
      orbitState.current.target.y += dy * panSpeed;
      orbitState.current.target.z -= (rightZ * dx - forwardZ * 0) * panSpeed;
      return;
    }

    // Camera Orbiting
    if (orbitState.current.isOrbiting) {
      const rotSpeed = 0.008;
      orbitState.current.rotY += dx * rotSpeed;
      orbitState.current.rotX = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, orbitState.current.rotX + dy * rotSpeed));
    }
  };

  const handleMouseUp = () => {
    orbitState.current.isOrbiting = false;
    orbitState.current.isPanning = false;
    orbitState.current.isDraggingGizmo = false;
    orbitState.current.activeGizmoAxis = null;
    setActiveGizmoAxisState(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    orbitState.current.distance = Math.max(5, Math.min(200, orbitState.current.distance * zoomFactor));
  };

  const resetCamera = () => {
    orbitState.current.rotX = 0.45;
    orbitState.current.rotY = -0.65;
    orbitState.current.distance = 48;
    orbitState.current.target.set(0, 10, 0);
  };

  const takeScreenshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${project.name.toLowerCase()}_render.png`;
    a.click();
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#181a1f]">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
      />

      {/* Floating Viewport Toolbar */}
      <div className="absolute top-3 left-3 flex items-center bg-[#21252b]/90 backdrop-blur-md border border-[#2c313a] rounded-lg shadow-xl p-1 gap-1 z-10">
        <button
          onClick={() => setActiveTool('select')}
          title="Select (V)"
          className={`p-1.5 rounded transition ${
            activeTool === 'select' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-[#2c313a]'
          }`}
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTool('translate')}
          title="Move / Translate (W)"
          className={`p-1.5 rounded transition ${
            activeTool === 'translate' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-[#2c313a]'
          }`}
        >
          <Move className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTool('rotate')}
          title="Rotate (E)"
          className={`p-1.5 rounded transition ${
            activeTool === 'rotate' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-[#2c313a]'
          }`}
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTool('scale')}
          title="Scale / Resize (R)"
          className={`p-1.5 rounded transition ${
            activeTool === 'scale' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-[#2c313a]'
          }`}
        >
          <Scaling className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#333842] mx-1" />

        <button
          onClick={() => setViewportSettings(s => ({ ...s, showGrid: !s.showGrid }))}
          title="Toggle Grid (G)"
          className={`p-1.5 rounded transition ${
            viewportSettings.showGrid ? 'text-blue-400 bg-[#2c313a]' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        <button
          onClick={() =>
            setViewportSettings(s => ({
              ...s,
              displayMode:
                s.displayMode === 'textured'
                  ? 'shaded'
                  : s.displayMode === 'shaded'
                  ? 'wireframe'
                  : s.displayMode === 'wireframe'
                  ? 'solid'
                  : 'textured',
            }))
          }
          title={`Display Mode: ${viewportSettings.displayMode}`}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#2c313a] text-xs font-mono px-2"
        >
          {viewportSettings.displayMode.toUpperCase()}
        </button>

        <button
          onClick={resetCamera}
          title="Reset Camera (Home)"
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#2c313a]"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={takeScreenshot}
          title="Capture Render Screenshot"
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#2c313a]"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Axis Gizmo Coordinate Hint */}
      <div className="absolute bottom-3 left-3 bg-[#21252b]/80 border border-[#2c313a] rounded px-2.5 py-1 text-[11px] font-mono text-gray-400 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> X: East
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Y: Up
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Z: South
        </span>
      </div>

      {/* Active Gizmo Drag Indicator */}
      {activeGizmoAxisState && (
        <div className="absolute top-14 left-3 bg-blue-600/90 text-white font-mono text-xs px-2.5 py-1 rounded shadow">
          Transforming: {activeGizmoAxisState.toUpperCase()} Axis
        </div>
      )}
    </div>
  );
};
