import React from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  MousePointer,
  Move,
  RotateCw,
  Scaling,
  Plus,
  FolderPlus,
  Copy,
  Trash2,
  Paintbrush,
  Eraser,
  PaintBucket,
  Pipette,
  Play,
  Pause,
  RotateCcw,
  Key,
  Repeat,
} from 'lucide-react';

export const ModeToolbar: React.FC = () => {
  const {
    mode,
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
    addCube,
    addGroup,
    duplicateSelected,
    deleteSelected,
    selectedElementIds,
    isPlaying,
    setIsPlaying,
    playheadTime,
    setPlayheadTime,
    setKeyframe,
    project,
    activeAnimationId,
  } = useProject();

  const handleAddKeyframeAtPlayhead = () => {
    if (!activeAnimationId || selectedElementIds.length === 0) return;
    const selectedId = selectedElementIds[0];

    // Find cube or group
    const cube = project.cubes.find(c => c.id === selectedId);
    const group = project.groups.find(g => g.id === selectedId);

    const rotation = cube ? cube.rotation : group ? group.rotation : [0, 0, 0];
    const position = cube ? cube.origin : group ? group.origin : [0, 0, 0];

    setKeyframe(activeAnimationId, selectedId, 'rotation', playheadTime, rotation as [number, number, number]);
    setKeyframe(activeAnimationId, selectedId, 'position', playheadTime, position as [number, number, number]);
  };

  return (
    <div className="h-9 bg-[#1e2227] border-b border-[#141619] flex items-center justify-between px-3 text-xs select-none">
      {/* Mode Specific Left Tools */}
      <div className="flex items-center gap-1.5">
        {mode === 'edit' && (
          <>
            <div className="flex items-center bg-[#282c34] rounded p-0.5 border border-[#333842]">
              <button
                onClick={() => setActiveTool('select')}
                title="Select Tool (V)"
                className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                  activeTool === 'select' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <MousePointer className="w-3.5 h-3.5" />
                <span>Select</span>
              </button>
              <button
                onClick={() => setActiveTool('translate')}
                title="Move / Translate (W)"
                className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                  activeTool === 'translate' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Move className="w-3.5 h-3.5" />
                <span>Move</span>
              </button>
              <button
                onClick={() => setActiveTool('rotate')}
                title="Rotate Tool (E)"
                className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                  activeTool === 'rotate' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>
              <button
                onClick={() => setActiveTool('scale')}
                title="Scale Tool (R)"
                className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                  activeTool === 'scale' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Scaling className="w-3.5 h-3.5" />
                <span>Scale</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-[#2c313a] mx-1" />

            <button
              onClick={() => addCube()}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#282c34] hover:bg-[#333842] text-gray-200 border border-[#3e4451] rounded transition"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>Add Cube</span>
            </button>

            <button
              onClick={() => addGroup()}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#282c34] hover:bg-[#333842] text-gray-200 border border-[#3e4451] rounded transition"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Group</span>
            </button>

            <button
              onClick={duplicateSelected}
              disabled={selectedElementIds.length === 0}
              className="p-1.5 rounded hover:bg-[#2c313a] text-gray-400 hover:text-white disabled:opacity-30"
              title="Duplicate (Ctrl+D)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={deleteSelected}
              disabled={selectedElementIds.length === 0}
              className="p-1.5 rounded hover:bg-red-900/40 text-gray-400 hover:text-red-400 disabled:opacity-30"
              title="Delete (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {mode === 'paint' && (
          <>
            <div className="flex items-center bg-[#282c34] rounded p-0.5 border border-[#333842]">
              <button
                onClick={() => setPaintTool('brush')}
                title="Brush Tool (B)"
                className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                  paintTool === 'brush' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Brush</span>
              </button>
              <button
                onClick={() => setPaintTool('eraser')}
                title="Eraser Tool (E)"
                className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                  paintTool === 'eraser' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Eraser</span>
              </button>
              <button
                onClick={() => setPaintTool('bucket')}
                title="Paint Bucket / Fill (G)"
                className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                  paintTool === 'bucket' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <PaintBucket className="w-3.5 h-3.5" />
                <span>Fill</span>
              </button>
              <button
                onClick={() => setPaintTool('picker')}
                title="Eyedropper (I)"
                className={`px-2 py-1 rounded flex items-center gap-1 transition ${
                  paintTool === 'picker' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Pipette className="w-3.5 h-3.5" />
                <span>Picker</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-[#2c313a] mx-1" />

            {/* Brush Size */}
            <div className="flex items-center gap-1 text-gray-400 font-mono text-[11px]">
              <span>Size:</span>
              {[1, 2, 4, 8].map(sz => (
                <button
                  key={sz}
                  onClick={() => setBrushSize(sz)}
                  className={`w-5 h-5 rounded flex items-center justify-center transition ${
                    brushSize === sz ? 'bg-blue-600 text-white font-bold' : 'bg-[#282c34] hover:bg-[#333842]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-[#2c313a] mx-1" />

            {/* Active Color Preview & Palette */}
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={paintColor}
                onChange={e => {
                  setPaintColor(e.target.value);
                  addColorToPalette(e.target.value);
                }}
                className="w-6 h-6 rounded cursor-pointer border border-[#3e4451] bg-transparent p-0"
                title="Select Paint Color"
              />
              <span className="font-mono text-gray-300 text-[11px]">{paintColor}</span>

              {/* Quick Swatches */}
              <div className="flex items-center gap-1 ml-2">
                {colorPalette.slice(0, 8).map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPaintColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-3.5 h-3.5 rounded-sm border ${
                      paintColor === c ? 'border-white scale-110 shadow' : 'border-black/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {mode === 'animate' && (
          <>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-1 rounded flex items-center gap-1.5 font-medium transition ${
                  isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => setPlayheadTime(0)}
                className="p-1.5 rounded hover:bg-[#2c313a] text-gray-400 hover:text-white"
                title="Rewind to start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleAddKeyframeAtPlayhead}
                disabled={selectedElementIds.length === 0}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition disabled:opacity-40"
              >
                <Key className="w-3.5 h-3.5" />
                <span>+ Keyframe</span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-[#2c313a] mx-2" />

            <div className="flex items-center gap-2 font-mono text-gray-300">
              <span className="text-gray-400">Time:</span>
              <span className="bg-[#181a1f] px-2 py-0.5 rounded border border-[#2c313a]">
                {playheadTime.toFixed(2)}s
              </span>
            </div>
          </>
        )}
      </div>

      {/* Right side info */}
      <div className="text-[11px] text-gray-400 font-mono flex items-center gap-3">
        <span>Format: <strong className="text-gray-200">{project.format.toUpperCase()}</strong></span>
        <span>Resolution: <strong className="text-gray-200">{project.textureResolution.width}x{project.textureResolution.height}</strong></span>
      </div>
    </div>
  );
};
