import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { FaceDirection } from '../../types/model';
import { Compass, Box, Sliders, Maximize2, RotateCw } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const {
    project,
    selectedElementIds,
    updateCube,
    updateGroup,
    selectedFace,
    setSelectedFace,
    updateCubeFace,
  } = useProject();

  if (selectedElementIds.length === 0) {
    return (
      <div className="w-64 h-full bg-[#1e2227] border-l border-[#141619] flex flex-col items-center justify-center text-gray-500 text-xs p-4 text-center select-none">
        <Box className="w-8 h-8 mb-2 opacity-30 text-gray-400" />
        <p>No element selected</p>
        <p className="text-[11px] text-gray-600 mt-1">Select a cube or bone in the outliner or 3D viewport to inspect properties.</p>
      </div>
    );
  }

  const activeId = selectedElementIds[0];
  const activeCube = project.cubes.find(c => c.id === activeId);
  const activeGroup = project.groups.find(g => g.id === activeId);

  if (activeGroup) {
    return (
      <div className="w-64 h-full bg-[#1e2227] border-l border-[#141619] flex flex-col select-none text-xs text-gray-300 overflow-y-auto">
        <div className="h-8 px-3 border-b border-[#141619] flex items-center font-semibold text-gray-200">
          GROUP PROPERTIES
        </div>

        <div className="p-3 space-y-4">
          <div>
            <label className="text-gray-400 text-[11px] block mb-1">Name</label>
            <input
              type="text"
              value={activeGroup.name}
              onChange={e => updateGroup(activeGroup.id, { name: e.target.value })}
              className="w-full bg-[#181a1f] border border-[#2c313a] rounded px-2 py-1 text-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Pivot / Origin */}
          <div>
            <label className="text-gray-400 text-[11px] block mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" /> Origin / Pivot (X, Y, Z)
            </label>
            <div className="grid grid-cols-3 gap-1">
              {['X', 'Y', 'Z'].map((axis, idx) => (
                <div key={axis} className="flex items-center bg-[#181a1f] border border-[#2c313a] rounded px-1.5 py-1">
                  <span className={`text-[10px] font-bold mr-1 ${idx === 0 ? 'text-red-400' : idx === 1 ? 'text-green-400' : 'text-blue-400'}`}>
                    {axis}
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={activeGroup.origin[idx]}
                    onChange={e => {
                      const newOrigin = [...activeGroup.origin] as [number, number, number];
                      newOrigin[idx] = parseFloat(e.target.value) || 0;
                      updateGroup(activeGroup.id, { origin: newOrigin });
                    }}
                    className="w-full bg-transparent text-white font-mono text-xs outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Rotation */}
          <div>
            <label className="text-gray-400 text-[11px] block mb-1 flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-blue-400" /> Rotation (deg)
            </label>
            <div className="grid grid-cols-3 gap-1">
              {['X', 'Y', 'Z'].map((axis, idx) => (
                <div key={axis} className="flex items-center bg-[#181a1f] border border-[#2c313a] rounded px-1.5 py-1">
                  <span className={`text-[10px] font-bold mr-1 ${idx === 0 ? 'text-red-400' : idx === 1 ? 'text-green-400' : 'text-blue-400'}`}>
                    {axis}
                  </span>
                  <input
                    type="number"
                    step="5"
                    value={activeGroup.rotation[idx]}
                    onChange={e => {
                      const newRot = [...activeGroup.rotation] as [number, number, number];
                      newRot[idx] = parseFloat(e.target.value) || 0;
                      updateGroup(activeGroup.id, { rotation: newRot });
                    }}
                    className="w-full bg-transparent text-white font-mono text-xs outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeCube) return null;

  const width = Math.max(0, activeCube.to[0] - activeCube.from[0]);
  const height = Math.max(0, activeCube.to[1] - activeCube.from[1]);
  const depth = Math.max(0, activeCube.to[2] - activeCube.from[2]);

  const facesList: FaceDirection[] = ['north', 'south', 'east', 'west', 'up', 'down'];

  return (
    <div className="w-64 h-full bg-[#1e2227] border-l border-[#141619] flex flex-col select-none text-xs text-gray-300 overflow-y-auto">
      <div className="h-8 px-3 border-b border-[#141619] flex items-center justify-between font-semibold text-gray-200">
        <span>ELEMENT PROPERTIES</span>
        <div
          className="w-3.5 h-3.5 rounded-full border border-black/40"
          style={{ backgroundColor: activeCube.color || '#4a90e2' }}
        />
      </div>

      <div className="p-3 space-y-4">
        {/* Name */}
        <div>
          <label className="text-gray-400 text-[11px] block mb-1">Name</label>
          <input
            type="text"
            value={activeCube.name}
            onChange={e => updateCube(activeCube.id, { name: e.target.value })}
            className="w-full bg-[#181a1f] border border-[#2c313a] rounded px-2 py-1 text-white focus:border-blue-500 outline-none"
          />
        </div>

        {/* Position / From */}
        <div>
          <label className="text-gray-400 text-[11px] block mb-1">Position / From (X, Y, Z)</label>
          <div className="grid grid-cols-3 gap-1">
            {['X', 'Y', 'Z'].map((axis, idx) => (
              <div key={axis} className="flex items-center bg-[#181a1f] border border-[#2c313a] rounded px-1.5 py-1">
                <span className={`text-[10px] font-bold mr-1 ${idx === 0 ? 'text-red-400' : idx === 1 ? 'text-green-400' : 'text-blue-400'}`}>
                  {axis}
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={activeCube.from[idx]}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    const diff = val - activeCube.from[idx];
                    const newFrom = [...activeCube.from] as [number, number, number];
                    const newTo = [...activeCube.to] as [number, number, number];
                    newFrom[idx] = val;
                    newTo[idx] += diff; // preserve size
                    updateCube(activeCube.id, { from: newFrom, to: newTo });
                  }}
                  className="w-full bg-transparent text-white font-mono text-xs outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Size (W, H, D) */}
        <div>
          <label className="text-gray-400 text-[11px] block mb-1 flex items-center justify-between">
            <span>Size (Width, Height, Depth)</span>
            <span className="text-[10px] text-gray-500 font-mono">
              {width.toFixed(1)} x {height.toFixed(1)} x {depth.toFixed(1)}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-1">
            {['W', 'H', 'D'].map((dim, idx) => {
              const currentSize = idx === 0 ? width : idx === 1 ? height : depth;
              return (
                <div key={dim} className="flex items-center bg-[#181a1f] border border-[#2c313a] rounded px-1.5 py-1">
                  <span className="text-[10px] font-bold mr-1 text-gray-400">{dim}</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={currentSize}
                    onChange={e => {
                      const newSz = Math.max(0.1, parseFloat(e.target.value) || 0.1);
                      const newTo = [...activeCube.to] as [number, number, number];
                      newTo[idx] = activeCube.from[idx] + newSz;
                      updateCube(activeCube.id, { to: newTo });
                    }}
                    className="w-full bg-transparent text-white font-mono text-xs outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Pivot / Origin */}
        <div>
          <label className="text-gray-400 text-[11px] block mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-400" /> Pivot Origin
            </span>
            <button
              onClick={() => {
                // Center pivot on cube
                updateCube(activeCube.id, {
                  origin: [
                    (activeCube.from[0] + activeCube.to[0]) / 2,
                    (activeCube.from[1] + activeCube.to[1]) / 2,
                    (activeCube.from[2] + activeCube.to[2]) / 2,
                  ],
                });
              }}
              className="text-[10px] text-blue-400 hover:underline"
            >
              Center
            </button>
          </label>
          <div className="grid grid-cols-3 gap-1">
            {['X', 'Y', 'Z'].map((axis, idx) => (
              <div key={axis} className="flex items-center bg-[#181a1f] border border-[#2c313a] rounded px-1.5 py-1">
                <span className={`text-[10px] font-bold mr-1 ${idx === 0 ? 'text-red-400' : idx === 1 ? 'text-green-400' : 'text-blue-400'}`}>
                  {axis}
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={activeCube.origin[idx]}
                  onChange={e => {
                    const newOrig = [...activeCube.origin] as [number, number, number];
                    newOrig[idx] = parseFloat(e.target.value) || 0;
                    updateCube(activeCube.id, { origin: newOrig });
                  }}
                  className="w-full bg-transparent text-white font-mono text-xs outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="text-gray-400 text-[11px] block mb-1 flex items-center gap-1">
            <RotateCw className="w-3 h-3 text-blue-400" /> Rotation (deg)
          </label>
          <div className="grid grid-cols-3 gap-1">
            {['X', 'Y', 'Z'].map((axis, idx) => (
              <div key={axis} className="flex items-center bg-[#181a1f] border border-[#2c313a] rounded px-1.5 py-1">
                <span className={`text-[10px] font-bold mr-1 ${idx === 0 ? 'text-red-400' : idx === 1 ? 'text-green-400' : 'text-blue-400'}`}>
                  {axis}
                </span>
                <input
                  type="number"
                  step="5"
                  value={activeCube.rotation[idx]}
                  onChange={e => {
                    const newRot = [...activeCube.rotation] as [number, number, number];
                    newRot[idx] = parseFloat(e.target.value) || 0;
                    updateCube(activeCube.id, { rotation: newRot });
                  }}
                  className="w-full bg-transparent text-white font-mono text-xs outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Inflate */}
        <div>
          <label className="text-gray-400 text-[11px] block mb-1">Inflate / Deflate</label>
          <input
            type="number"
            step="0.1"
            value={activeCube.inflate}
            onChange={e => updateCube(activeCube.id, { inflate: parseFloat(e.target.value) || 0 })}
            className="w-full bg-[#181a1f] border border-[#2c313a] rounded px-2 py-1 text-white font-mono text-xs outline-none"
          />
        </div>

        {/* Face UV Section */}
        <div className="pt-2 border-t border-[#2c313a]">
          <div className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Faces & UV Mapping</span>
            <span className="text-[10px] text-blue-400 capitalize">{selectedFace}</span>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-3">
            {facesList.map(face => {
              const isFaceActive = selectedFace === face;
              return (
                <button
                  key={face}
                  onClick={() => setSelectedFace(face)}
                  className={`py-1 px-1 rounded uppercase text-[10px] font-mono tracking-wider transition ${
                    isFaceActive
                      ? 'bg-blue-600 text-white font-bold shadow'
                      : 'bg-[#181a1f] hover:bg-[#2c313a] text-gray-400'
                  }`}
                >
                  {face}
                </button>
              );
            })}
          </div>

          {selectedFace && activeCube.faces[selectedFace] && (
            <div className="bg-[#181a1f] p-2 rounded border border-[#2c313a] space-y-2">
              <div className="text-[11px] text-gray-400 font-mono">
                UV [X1, Y1, X2, Y2]
              </div>
              <div className="grid grid-cols-4 gap-1">
                {activeCube.faces[selectedFace].uv.map((val, idx) => (
                  <input
                    key={idx}
                    type="number"
                    value={val}
                    onChange={e => {
                      const newUV = [...activeCube.faces[selectedFace!].uv] as [number, number, number, number];
                      newUV[idx] = parseInt(e.target.value) || 0;
                      updateCubeFace(activeCube.id, selectedFace!, { uv: newUV });
                    }}
                    className="bg-[#21252b] text-white font-mono text-[11px] px-1 py-0.5 rounded text-center outline-none border border-[#333842]"
                  />
                ))}
              </div>

              {/* Rotation */}
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Face Rotation:</span>
                <select
                  value={activeCube.faces[selectedFace].rotation}
                  onChange={e =>
                    updateCubeFace(activeCube.id, selectedFace!, {
                      rotation: parseInt(e.target.value) as any,
                    })
                  }
                  className="bg-[#21252b] text-white rounded px-2 py-0.5 border border-[#333842] outline-none"
                >
                  <option value={0}>0°</option>
                  <option value={90}>90°</option>
                  <option value={180}>180°</option>
                  <option value={270}>270°</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
