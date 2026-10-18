import React, { useRef, useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  Image,
  Plus,
  Upload,
  Download,
  Trash2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Palette,
  Eye,
} from 'lucide-react';
import { generateVoxelTexture } from '../../presets/sampleModels';

export const TexturePanel: React.FC = () => {
  const {
    project,
    activeTextureId,
    setActiveTextureId,
    addTexture,
    paintPixelOnTexture,
    paintTool,
    brushSize,
    paintColor,
    setPaintColor,
    colorPalette,
    addColorToPalette,
    selectedElementIds,
    selectedFace,
    setCubeFaceUV,
  } = useProject();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const activeTexture = project.textures.find(t => t.id === activeTextureId) || project.textures[0];
  const activeCube = project.cubes.find(c => c.id === selectedElementIds[0]);
  const activeFaceData = activeCube && selectedFace ? activeCube.faces[selectedFace] : null;

  // Render texture canvas + UV overlay
  useEffect(() => {
    if (!canvasRef.current || !activeTexture) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = activeTexture.width;
      canvas.height = activeTexture.height;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0);

      // Draw active face UV box overlay
      if (activeFaceData && activeFaceData.uv) {
        const [u1, v1, u2, v2] = activeFaceData.uv;
        const x = Math.min(u1, u2);
        const y = Math.min(v1, v2);
        const w = Math.abs(u2 - u1);
        const h = Math.abs(v2 - v1);

        // Semi-transparent highlight
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.fillRect(x, y, w, h);

        // Highlight border
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '7px sans-serif';
        ctx.fillText(selectedFace || '', x + 2, y + 8);
      }
    };
    img.src = activeTexture.dataUrl;
  }, [activeTexture, activeFaceData, selectedFace]);

  // Texture Canvas Drawing (Paint mode or quick texture editing)
  const handleCanvasAction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !activeTexture) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const px = Math.floor((e.clientX - rect.left) * scaleX);
    const py = Math.floor((e.clientY - rect.top) * scaleY);

    if (px < 0 || px >= activeTexture.width || py < 0 || py >= activeTexture.height) return;

    if (paintTool === 'picker') {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const pixel = ctx.getImageData(px, py, 1, 1).data;
        const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
        setPaintColor(hex);
        addColorToPalette(hex);
      }
      return;
    }

    const color = paintTool === 'eraser' ? '#181a1f' : paintColor;
    paintPixelOnTexture(activeTexture.id, px, py, color);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    handleCanvasAction(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    handleCanvasAction(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Upload image handler
  const handleUploadTexture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        addTexture(file.name, dataUrl, img.width, img.height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const createBlankTexture = () => {
    const defaultData = generateVoxelTexture('steve', 64, 64);
    addTexture(`texture_${project.textures.length + 1}.png`, defaultData, 64, 64);
  };

  const downloadCurrentTexture = () => {
    if (!activeTexture) return;
    const a = document.createElement('a');
    a.href = activeTexture.dataUrl;
    a.download = activeTexture.name;
    a.click();
  };

  return (
    <div className="w-64 h-full bg-[#21252b] border-r border-[#181a1f] flex flex-col select-none text-xs text-gray-300">
      {/* Texture List Header */}
      <div className="h-8 px-3 border-b border-[#181a1f] flex items-center justify-between font-semibold text-gray-200">
        <span className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-blue-400" />
          <span>TEXTURES</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={createBlankTexture}
            className="p-1 hover:bg-[#2c313a] text-blue-400 rounded"
            title="Create Blank Texture"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 hover:bg-[#2c313a] text-gray-400 hover:text-white rounded"
            title="Import Texture PNG"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadTexture}
        accept="image/png,image/jpeg"
        className="hidden"
      />

      {/* Texture List Thumbnails */}
      <div className="max-h-28 overflow-y-auto p-1.5 border-b border-[#181a1f] space-y-1">
        {project.textures.map(tex => {
          const isSelected = tex.id === activeTextureId;
          return (
            <div
              key={tex.id}
              onClick={() => setActiveTextureId(tex.id)}
              className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition ${
                isSelected ? 'bg-blue-600 text-white' : 'hover:bg-[#2c313a] text-gray-300'
              }`}
            >
              <img
                src={tex.dataUrl}
                alt={tex.name}
                className="w-7 h-7 rounded border border-black/30 pixelated object-cover bg-black/40"
              />
              <div className="flex-1 overflow-hidden">
                <div className="truncate font-medium text-xs">{tex.name}</div>
                <div className="text-[10px] opacity-70 font-mono">
                  {tex.width} x {tex.height}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* UV Map & Texture Visualizer Header */}
      <div className="h-7 px-3 bg-[#1e2227] border-b border-[#181a1f] flex items-center justify-between text-[11px] font-semibold text-gray-400">
        <span>UV / PIXEL CANVAS</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(1, z - 1))}
            className="p-0.5 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="font-mono text-[10px]">{zoom}x</span>
          <button
            onClick={() => setZoom(z => Math.min(8, z + 1))}
            className="p-0.5 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={downloadCurrentTexture}
            className="p-0.5 hover:text-white ml-1"
            title="Download Texture"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2D Canvas Area */}
      <div className="flex-1 overflow-auto p-3 flex items-center justify-center bg-[#181a1f]">
        {activeTexture ? (
          <div
            className="border border-[#2c313a] shadow-xl rounded overflow-hidden bg-[repeating-conic-gradient(#21252b_0%_25%,#1e2227_0%_50%)] bg-[length:16px_16px]"
            style={{
              width: activeTexture.width * zoom,
              height: activeTexture.height * zoom,
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full pixelated cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        ) : (
          <div className="text-gray-500 italic">No texture loaded</div>
        )}
      </div>

      {/* Color Swatches Palette */}
      <div className="p-2.5 border-t border-[#181a1f] bg-[#1e2227]">
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
          <span>Palette Swatches</span>
          <span className="font-mono text-[10px] text-white">{paintColor}</span>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {colorPalette.map((col, idx) => (
            <button
              key={idx}
              onClick={() => setPaintColor(col)}
              style={{ backgroundColor: col }}
              className={`w-5 h-5 rounded-sm border transition ${
                paintColor === col ? 'border-white scale-110 shadow' : 'border-black/50 hover:scale-105'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
