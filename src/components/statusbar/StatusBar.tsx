import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Box, Layers, Grid, Activity } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { project, selectedElementIds, mode } = useProject();

  const selectedCube = project.cubes.find(c => c.id === selectedElementIds[0]);
  const selectedGroup = project.groups.find(g => g.id === selectedElementIds[0]);

  const totalVertices = project.cubes.length * 8;
  const totalFaces = project.cubes.length * 6;

  return (
    <div className="h-6 bg-[#181a1f] border-t border-[#121417] flex items-center justify-between px-3 text-[11px] text-gray-400 font-mono select-none">
      {/* Left: Selection info */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-gray-300">
          <Box className="w-3 h-3 text-blue-400" />
          {selectedCube ? (
            <span>
              Cube: <strong className="text-white">{selectedCube.name}</strong> ({selectedCube.to[0] - selectedCube.from[0]}x{selectedCube.to[1] - selectedCube.from[1]}x{selectedCube.to[2] - selectedCube.from[2]})
            </span>
          ) : selectedGroup ? (
            <span>
              Group: <strong className="text-white">{selectedGroup.name}</strong>
            </span>
          ) : (
            <span>No selection</span>
          )}
        </span>

        {selectedElementIds.length > 1 && (
          <span className="bg-[#21252b] px-1.5 py-0.5 rounded text-blue-400">
            {selectedElementIds.length} selected
          </span>
        )}
      </div>

      {/* Center: Mode & Stats */}
      <div className="flex items-center gap-4 text-gray-500">
        <span>Cubes: <strong className="text-gray-300">{project.cubes.length}</strong></span>
        <span>Faces: <strong className="text-gray-300">{totalFaces}</strong></span>
        <span>Vertices: <strong className="text-gray-300">{totalVertices}</strong></span>
      </div>

      {/* Right: Grid Snap & Engine */}
      <div className="flex items-center gap-3 text-gray-400">
        <span className="flex items-center gap-1">
          <Grid className="w-3 h-3 text-gray-500" />
          <span>Snap: 0.5</span>
        </span>
        <span className="text-gray-500">|</span>
        <span className="text-blue-400 font-sans font-medium text-[10px]">
          Blockbench React
        </span>
      </div>
    </div>
  );
};
