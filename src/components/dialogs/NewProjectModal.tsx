import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Box, Cuboid as CubeIcon, Sparkles, Layers, Shield } from 'lucide-react';
import { createCreeperPreset, createChestPreset, createBlockPreset, createDefaultFaces, generateVoxelTexture } from '../../presets/sampleModels';
import { ProjectData } from '../../types/model';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { loadProject } = useProject();

  const [projectName, setProjectName] = useState('New Model');
  const [format, setFormat] = useState<'bedrock' | 'java_block' | 'generic' | 'skin'>('bedrock');
  const [resolution, setResolution] = useState<number>(64);

  if (!isOpen) return null;

  const handleCreateEmpty = () => {
    const texUrl = generateVoxelTexture('steve', resolution, resolution);
    const textureId = 'tex_default';

    const newProject: ProjectData = {
      id: `proj_${Date.now()}`,
      name: projectName.trim() || 'New Model',
      format,
      textureResolution: { width: resolution, height: resolution },
      cubes: [
        {
          id: 'cube_main',
          name: 'cube',
          type: 'cube',
          from: [-4, 0, -4],
          to: [4, 8, 4],
          origin: [0, 4, 0],
          rotation: [0, 0, 0],
          inflate: 0,
          color: '#3b82f6',
          visibility: true,
          locked: false,
          faces: createDefaultFaces(textureId),
        },
      ],
      groups: [],
      textures: [
        {
          id: textureId,
          name: 'texture.png',
          width: resolution,
          height: resolution,
          dataUrl: texUrl,
        },
      ],
      animations: [
        {
          id: 'anim_idle',
          name: 'idle',
          length: 2.0,
          loop: true,
          fps: 24,
          animators: {},
        },
      ],
    };

    loadProject(newProject);
    onClose();
  };

  const handleSelectPreset = (preset: 'creeper' | 'chest' | 'block') => {
    if (preset === 'creeper') loadProject(createCreeperPreset());
    else if (preset === 'chest') loadProject(createChestPreset());
    else loadProject(createBlockPreset());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-lg bg-[#21252b] border border-[#2c313a] rounded-lg shadow-2xl overflow-hidden text-gray-200">
        {/* Header */}
        <div className="px-4 py-3 bg-[#1e2227] border-b border-[#181a1f] flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Box className="w-4 h-4 text-blue-400" />
            <span>New Blockbench Model</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#2c313a] rounded text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs">
          {/* Quick Presets */}
          <div>
            <label className="text-gray-400 font-semibold uppercase tracking-wider text-[11px] block mb-2">
              Start with a Preset Model
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSelectPreset('creeper')}
                className="p-3 bg-[#181a1f] hover:bg-[#2c313a] border border-[#2c313a] hover:border-blue-500 rounded-lg text-left transition group"
              >
                <div className="w-7 h-7 rounded bg-green-900/40 text-green-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition">
                  C
                </div>
                <div className="font-semibold text-white">Creeper</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Rigged entity with walk animation</div>
              </button>

              <button
                onClick={() => handleSelectPreset('chest')}
                className="p-3 bg-[#181a1f] hover:bg-[#2c313a] border border-[#2c313a] hover:border-blue-500 rounded-lg text-left transition group"
              >
                <div className="w-7 h-7 rounded bg-amber-900/40 text-amber-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition">
                  B
                </div>
                <div className="font-semibold text-white">Chest</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Wood chest with hinged lid animation</div>
              </button>

              <button
                onClick={() => handleSelectPreset('block')}
                className="p-3 bg-[#181a1f] hover:bg-[#2c313a] border border-[#2c313a] hover:border-blue-500 rounded-lg text-left transition group"
              >
                <div className="w-7 h-7 rounded bg-blue-900/40 text-blue-400 flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition">
                  T
                </div>
                <div className="font-semibold text-white">Block</div>
                <div className="text-[11px] text-gray-400 mt-0.5">16x16 standard Minecraft block</div>
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-[#2c313a]" />

          {/* Custom Project Form */}
          <div className="space-y-3">
            <label className="text-gray-400 font-semibold uppercase tracking-wider text-[11px] block">
              Or Create Custom Project
            </label>

            <div>
              <label className="text-gray-400 block mb-1">Model Name</label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                className="w-full bg-[#181a1f] border border-[#2c313a] rounded px-3 py-1.5 text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1">Target Format</label>
                <select
                  value={format}
                  onChange={e => setFormat(e.target.value as any)}
                  className="w-full bg-[#181a1f] border border-[#2c313a] rounded px-2.5 py-1.5 text-white outline-none"
                >
                  <option value="bedrock">Bedrock Entity Model</option>
                  <option value="java_block">Java Block / Item</option>
                  <option value="generic">Generic Low-Poly Model</option>
                  <option value="skin">Minecraft Skin</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Texture Resolution</label>
                <select
                  value={resolution}
                  onChange={e => setResolution(parseInt(e.target.value))}
                  className="w-full bg-[#181a1f] border border-[#2c313a] rounded px-2.5 py-1.5 text-white outline-none"
                >
                  <option value={16}>16 x 16 (Standard Block)</option>
                  <option value={32}>32 x 32 (HD)</option>
                  <option value={64}>64 x 64 (Mob / Skin)</option>
                  <option value={128}>128 x 128 (Ultra HD)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#1e2227] border-t border-[#181a1f] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded hover:bg-[#2c313a] text-gray-300 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateEmpty}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow"
          >
            Create Model
          </button>
        </div>
      </div>
    </div>
  );
};
