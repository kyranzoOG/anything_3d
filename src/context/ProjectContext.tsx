import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ProjectData,
  CubeElement,
  GroupElement,
  FaceDirection,
  FaceUV,
  AppMode,
  TransformTool,
  PaintTool,
  ViewportSettings,
  AnimationClip,
  Keyframe,
  NodeAnimationData,
  TextureAsset,
} from '../types/model';
import { createCreeperPreset, createChestPreset, createBlockPreset, createDefaultFaces } from '../presets/sampleModels';

interface ProjectContextType {
  project: ProjectData;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  activeTool: TransformTool;
  setActiveTool: (tool: TransformTool) => void;
  paintTool: PaintTool;
  setPaintTool: (tool: PaintTool) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  paintColor: string;
  setPaintColor: (color: string) => void;
  colorPalette: string[];
  addColorToPalette: (color: string) => void;
  selectedElementIds: string[];
  selectedFace: FaceDirection | null;
  setSelectedFace: (face: FaceDirection | null) => void;
  selectElement: (id: string, multiSelect?: boolean) => void;
  selectAll: () => void;
  deselectAll: () => void;
  activeAnimationId: string | null;
  setActiveAnimationId: (id: string | null) => void;
  playheadTime: number;
  setPlayheadTime: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  viewportSettings: ViewportSettings;
  setViewportSettings: React.Dispatch<React.SetStateAction<ViewportSettings>>;
  // CRUD
  addCube: (groupId?: string | null) => string;
  addGroup: () => string;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  updateCube: (id: string, updates: Partial<CubeElement>) => void;
  updateGroup: (id: string, updates: Partial<GroupElement>) => void;
  updateCubeFace: (cubeId: string, face: FaceDirection, updates: Partial<FaceUV>) => void;
  setCubeFaceUV: (cubeId: string, face: FaceDirection, uv: [number, number, number, number]) => void;
  // Texture
  activeTextureId: string | null;
  setActiveTextureId: (id: string | null) => void;
  addTexture: (name: string, dataUrl: string, width?: number, height?: number) => void;
  paintPixelOnTexture: (textureId: string, x: number, y: number, color: string) => void;
  paintAreaOnTexture: (textureId: string, x: number, y: number, w: number, h: number, color: string) => void;
  // Animation
  addAnimation: (name: string) => void;
  setKeyframe: (
    animId: string,
    nodeId: string,
    channel: 'position' | 'rotation' | 'scale',
    time: number,
    value: [number, number, number]
  ) => void;
  // Load / Preset / History
  loadProject: (project: ProjectData) => void;
  resetToPreset: (preset: 'creeper' | 'chest' | 'block') => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

const DEFAULT_PALETTE = [
  '#000000', '#ffffff', '#7f7f7f', '#c3c3c3',
  '#4da338', '#2d6f1c', '#72c858', '#111811',
  '#a06e3b', '#65421c', '#d59d7b', '#00a3a3',
  '#263473', '#e03a3a', '#ff9800', '#ffeb3b',
];

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<ProjectData>(createCreeperPreset);
  const [mode, setMode] = useState<AppMode>('edit');
  const [activeTool, setActiveTool] = useState<TransformTool>('select');
  const [paintTool, setPaintTool] = useState<PaintTool>('brush');
  const [brushSize, setBrushSize] = useState<number>(1);
  const [paintColor, setPaintColor] = useState<string>('#ffffff');
  const [colorPalette, setColorPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>(['cube_head']);
  const [selectedFace, setSelectedFace] = useState<FaceDirection | null>('north');

  const [activeTextureId, setActiveTextureId] = useState<string | null>(
    project.textures[0]?.id || null
  );

  const [activeAnimationId, setActiveAnimationId] = useState<string | null>(
    project.animations[0]?.id || null
  );
  const [playheadTime, setPlayheadTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    displayMode: 'textured',
    showGrid: true,
    showAxes: true,
    showPivots: true,
    showOutlines: true,
    cameraFov: 45,
    cameraView: 'perspective',
  });

  // Undo / Redo history
  const [history, setHistory] = useState<ProjectData[]>([]);
  const [future, setFuture] = useState<ProjectData[]>([]);

  const pushHistory = useCallback((current: ProjectData) => {
    setHistory(prev => [...prev.slice(-30), JSON.parse(JSON.stringify(current))]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setFuture(prev => [JSON.parse(JSON.stringify(project)), ...prev]);
    setProject(previous);
  }, [history, project]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(project))]);
    setProject(next);
  }, [future, project]);

  // Keep activeTextureId valid if project changes
  useEffect(() => {
    if (project.textures.length > 0 && (!activeTextureId || !project.textures.find(t => t.id === activeTextureId))) {
      setActiveTextureId(project.textures[0].id);
    }
    if (project.animations.length > 0 && (!activeAnimationId || !project.animations.find(a => a.id === activeAnimationId))) {
      setActiveAnimationId(project.animations[0].id);
    }
  }, [project.textures, project.animations, activeTextureId, activeAnimationId]);

  // Animation playback timer
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const currentAnim = project.animations.find(a => a.id === activeAnimationId);
    if (!currentAnim) {
      setIsPlaying(false);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setPlayheadTime(prev => {
        let nextTime = prev + delta;
        if (nextTime >= currentAnim.length) {
          if (currentAnim.loop) {
            nextTime = nextTime % currentAnim.length;
          } else {
            setIsPlaying(false);
            return currentAnim.length;
          }
        }
        return nextTime;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, activeAnimationId, project.animations]);

  // Element Selection
  const selectElement = useCallback((id: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedElementIds(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    } else {
      setSelectedElementIds([id]);
    }
  }, []);

  const selectAll = useCallback(() => {
    setSelectedElementIds(project.cubes.map(c => c.id));
  }, [project.cubes]);

  const deselectAll = useCallback(() => {
    setSelectedElementIds([]);
  }, []);

  // CRUD Operations
  const addCube = useCallback((groupId: string | null = null): string => {
    pushHistory(project);
    const newId = `cube_${Math.random().toString(36).substring(2, 9)}`;
    const newCube: CubeElement = {
      id: newId,
      name: `cube_${project.cubes.length + 1}`,
      type: 'cube',
      from: [-2, 0, -2],
      to: [2, 4, 2],
      origin: [0, 2, 0],
      rotation: [0, 0, 0],
      inflate: 0,
      color: '#4a90e2',
      visibility: true,
      locked: false,
      groupId: groupId || null,
      faces: createDefaultFaces(activeTextureId),
    };

    setProject(prev => ({
      ...prev,
      cubes: [...prev.cubes, newCube],
    }));
    setSelectedElementIds([newId]);
    return newId;
  }, [project, activeTextureId, pushHistory]);

  const addGroup = useCallback((): string => {
    pushHistory(project);
    const newId = `grp_${Math.random().toString(36).substring(2, 9)}`;
    const newGroup: GroupElement = {
      id: newId,
      name: `bone_${project.groups.length + 1}`,
      type: 'group',
      origin: [0, 0, 0],
      rotation: [0, 0, 0],
      visibility: true,
      locked: false,
      isOpen: true,
    };

    setProject(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }));
    setSelectedElementIds([newId]);
    return newId;
  }, [project, pushHistory]);

  const duplicateSelected = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    pushHistory(project);

    const newCubes: CubeElement[] = [];
    const newSelected: string[] = [];

    project.cubes.forEach(cube => {
      if (selectedElementIds.includes(cube.id)) {
        const dupId = `cube_${Math.random().toString(36).substring(2, 9)}`;
        newCubes.push({
          ...JSON.parse(JSON.stringify(cube)),
          id: dupId,
          name: `${cube.name}_copy`,
          from: [cube.from[0] + 1, cube.from[1] + 1, cube.from[2] + 1],
          to: [cube.to[0] + 1, cube.to[1] + 1, cube.to[2] + 1],
        });
        newSelected.push(dupId);
      }
    });

    if (newCubes.length > 0) {
      setProject(prev => ({
        ...prev,
        cubes: [...prev.cubes, ...newCubes],
      }));
      setSelectedElementIds(newSelected);
    }
  }, [selectedElementIds, project, pushHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    pushHistory(project);

    setProject(prev => ({
      ...prev,
      cubes: prev.cubes.filter(c => !selectedElementIds.includes(c.id)),
      groups: prev.groups.filter(g => !selectedElementIds.includes(g.id)),
    }));
    setSelectedElementIds([]);
  }, [selectedElementIds, project, pushHistory]);

  const updateCube = useCallback((id: string, updates: Partial<CubeElement>) => {
    setProject(prev => ({
      ...prev,
      cubes: prev.cubes.map(cube => (cube.id === id ? { ...cube, ...updates } : cube)),
    }));
  }, []);

  const updateGroup = useCallback((id: string, updates: Partial<GroupElement>) => {
    setProject(prev => ({
      ...prev,
      groups: prev.groups.map(group => (group.id === id ? { ...group, ...updates } : group)),
    }));
  }, []);

  const updateCubeFace = useCallback((cubeId: string, face: FaceDirection, updates: Partial<FaceUV>) => {
    setProject(prev => ({
      ...prev,
      cubes: prev.cubes.map(cube => {
        if (cube.id !== cubeId) return cube;
        return {
          ...cube,
          faces: {
            ...cube.faces,
            [face]: {
              ...cube.faces[face],
              ...updates,
            },
          },
        };
      }),
    }));
  }, []);

  const setCubeFaceUV = useCallback(
    (cubeId: string, face: FaceDirection, uv: [number, number, number, number]) => {
      updateCubeFace(cubeId, face, { uv });
    },
    [updateCubeFace]
  );

  // Palette
  const addColorToPalette = useCallback((color: string) => {
    setColorPalette(prev => (prev.includes(color) ? prev : [color, ...prev.slice(0, 23)]));
  }, []);

  // Textures
  const addTexture = useCallback(
    (name: string, dataUrl: string, width = 64, height = 64) => {
      pushHistory(project);
      const newTex: TextureAsset = {
        id: `tex_${Math.random().toString(36).substring(2, 9)}`,
        name,
        width,
        height,
        dataUrl,
      };
      setProject(prev => ({
        ...prev,
        textures: [...prev.textures, newTex],
      }));
      setActiveTextureId(newTex.id);
    },
    [project, pushHistory]
  );

  const paintPixelOnTexture = useCallback(
    (textureId: string, px: number, py: number, color: string) => {
      const targetTex = project.textures.find(t => t.id === textureId);
      if (!targetTex) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetTex.width;
        canvas.height = targetTex.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        ctx.fillStyle = color;
        const radius = brushSize;
        ctx.fillRect(
          Math.max(0, Math.floor(px - (radius - 1) / 2)),
          Math.max(0, Math.floor(py - (radius - 1) / 2)),
          radius,
          radius
        );

        const updatedDataUrl = canvas.toDataURL('image/png');
        setProject(prev => ({
          ...prev,
          textures: prev.textures.map(t =>
            t.id === textureId ? { ...t, dataUrl: updatedDataUrl } : t
          ),
        }));
      };
      img.src = targetTex.dataUrl;
    },
    [project.textures, brushSize]
  );

  const paintAreaOnTexture = useCallback(
    (textureId: string, x: number, y: number, w: number, h: number, color: string) => {
      const targetTex = project.textures.find(t => t.id === textureId);
      if (!targetTex) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetTex.width;
        canvas.height = targetTex.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);

        const updatedDataUrl = canvas.toDataURL('image/png');
        setProject(prev => ({
          ...prev,
          textures: prev.textures.map(t =>
            t.id === textureId ? { ...t, dataUrl: updatedDataUrl } : t
          ),
        }));
      };
      img.src = targetTex.dataUrl;
    },
    [project.textures]
  );

  // Animation Management
  const addAnimation = useCallback(
    (name: string) => {
      pushHistory(project);
      const newAnim: AnimationClip = {
        id: `anim_${Math.random().toString(36).substring(2, 9)}`,
        name,
        length: 2.0,
        loop: true,
        fps: 24,
        animators: {},
      };
      setProject(prev => ({
        ...prev,
        animations: [...prev.animations, newAnim],
      }));
      setActiveAnimationId(newAnim.id);
      setPlayheadTime(0);
    },
    [project, pushHistory]
  );

  const setKeyframe = useCallback(
    (
      animId: string,
      nodeId: string,
      channel: 'position' | 'rotation' | 'scale',
      time: number,
      value: [number, number, number]
    ) => {
      setProject(prev => ({
        ...prev,
        animations: prev.animations.map(anim => {
          if (anim.id !== animId) return anim;

          const currentAnimators = { ...anim.animators };
          const nodeData: NodeAnimationData = currentAnimators[nodeId] || {
            position: [],
            rotation: [],
            scale: [],
          };

          const track = [...nodeData[channel]];
          const existingIdx = track.findIndex(kf => Math.abs(kf.time - time) < 0.02);

          const newKf: Keyframe = {
            time: Number(time.toFixed(3)),
            value: [Number(value[0].toFixed(2)), Number(value[1].toFixed(2)), Number(value[2].toFixed(2))],
            interpolation: 'smooth',
          };

          if (existingIdx >= 0) {
            track[existingIdx] = newKf;
          } else {
            track.push(newKf);
            track.sort((a, b) => a.time - b.time);
          }

          currentAnimators[nodeId] = {
            ...nodeData,
            [channel]: track,
          };

          return {
            ...anim,
            animators: currentAnimators,
          };
        }),
      }));
    },
    []
  );

  // Load / Preset
  const loadProject = useCallback((newProj: ProjectData) => {
    setProject(newProj);
    setSelectedElementIds(newProj.cubes[0] ? [newProj.cubes[0].id] : []);
    setActiveTextureId(newProj.textures[0]?.id || null);
    setActiveAnimationId(newProj.animations[0]?.id || null);
    setPlayheadTime(0);
    setIsPlaying(false);
    setHistory([]);
    setFuture([]);
  }, []);

  const resetToPreset = useCallback(
    (preset: 'creeper' | 'chest' | 'block') => {
      let p: ProjectData;
      if (preset === 'creeper') p = createCreeperPreset();
      else if (preset === 'chest') p = createChestPreset();
      else p = createBlockPreset();
      loadProject(p);
    },
    [loadProject]
  );

  return (
    <ProjectContext.Provider
      value={{
        project,
        mode,
        setMode,
        activeTool,
        setActiveTool,
        paintTool,
        setPaintTool,
        brushSize,
        setBrushSize,
        paintColor,
        setPaintColor,
        colorPalette,
        addColorToPalette,
        selectedElementIds,
        selectedFace,
        setSelectedFace,
        selectElement,
        selectAll,
        deselectAll,
        activeAnimationId,
        setActiveAnimationId,
        playheadTime,
        setPlayheadTime,
        isPlaying,
        setIsPlaying,
        viewportSettings,
        setViewportSettings,
        addCube,
        addGroup,
        duplicateSelected,
        deleteSelected,
        updateCube,
        updateGroup,
        updateCubeFace,
        setCubeFaceUV,
        activeTextureId,
        setActiveTextureId,
        addTexture,
        paintPixelOnTexture,
        paintAreaOnTexture,
        addAnimation,
        setKeyframe,
        loadProject,
        resetToPreset,
        undo,
        redo,
        canUndo: history.length > 0,
        canRedo: future.length > 0,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return ctx;
};
