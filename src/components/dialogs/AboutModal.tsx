import React from 'react';
import { X, Box, Keyboard, Mouse, Compass } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-md bg-[#21252b] border border-[#2c313a] rounded-lg shadow-2xl overflow-hidden text-gray-200">
        <div className="px-4 py-3 bg-[#1e2227] border-b border-[#181a1f] flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Box className="w-4 h-4 text-blue-400" />
            <span>About Blockbench</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#2c313a] rounded text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="flex items-center gap-3 bg-[#181a1f] p-3 rounded-lg border border-[#2c313a]">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow">
              B
            </div>
            <div>
              <div className="font-bold text-white text-sm">Blockbench React</div>
              <div className="text-gray-400">Low-poly 3D modeling, texturing, and animation workstation</div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-gray-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Mouse className="w-3.5 h-3.5 text-blue-400" /> Viewport Controls
            </div>
            <div className="bg-[#181a1f] p-2.5 rounded border border-[#2c313a] space-y-1 text-gray-400">
              <div className="flex justify-between">
                <span>Orbit / Rotate View:</span>
                <span className="text-white font-mono">Left Click + Drag</span>
              </div>
              <div className="flex justify-between">
                <span>Pan Camera:</span>
                <span className="text-white font-mono">Right Click or Shift + Drag</span>
              </div>
              <div className="flex justify-between">
                <span>Zoom In / Out:</span>
                <span className="text-white font-mono">Mouse Scroll Wheel</span>
              </div>
              <div className="flex justify-between">
                <span>Select Cube:</span>
                <span className="text-white font-mono">Left Click Cube</span>
              </div>
            </div>
          </div>

          <div>
            <div className="font-semibold text-gray-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-amber-400" /> Keyboard Shortcuts
            </div>
            <div className="bg-[#181a1f] p-2.5 rounded border border-[#2c313a] space-y-1 text-gray-400 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="font-sans">Select Tool</span>
                <span className="text-white bg-[#282c34] px-1 rounded">V</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">Move / Translate</span>
                <span className="text-white bg-[#282c34] px-1 rounded">W</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">Rotate</span>
                <span className="text-white bg-[#282c34] px-1 rounded">E</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">Scale</span>
                <span className="text-white bg-[#282c34] px-1 rounded">R</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans">Undo / Redo</span>
                <span className="text-white bg-[#282c34] px-1 rounded">Ctrl+Z / Ctrl+Y</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-[#1e2227] border-t border-[#181a1f] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#282c34] hover:bg-[#333842] text-white rounded font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
