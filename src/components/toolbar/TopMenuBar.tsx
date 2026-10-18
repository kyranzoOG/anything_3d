import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { AppMode } from '../../types/model';
import {
  FolderOpen,
  Save,
  Download,
  Upload,
  Undo2,
  Redo2,
  Box,
  Palette,
  Film,
  HelpCircle,
  Sparkles,
  ChevronDown,
  Layers,
  FileCode,
  FileBox,
} from 'lucide-react';
import { exportBBModel, exportJavaBlockModel, exportWavefrontOBJ, downloadFile, importProject } from '../../utils/ioFormats';

interface TopMenuBarProps {
  onOpenNewModal: () => void;
  onOpenAboutModal: () => void;
}

export const TopMenuBar: React.FC<TopMenuBarProps> = ({ onOpenNewModal, onOpenAboutModal }) => {
  const {
    project,
    mode,
    setMode,
    undo,
    redo,
    canUndo,
    canRedo,
    resetToPreset,
    loadProject,
    duplicateSelected,
    deleteSelected,
    selectAll,
    deselectAll,
  } = useProject();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutside = () => {
      setActiveMenu(null);
      setShowExportMenu(false);
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const handleMenuClick = (e: React.MouseEvent, menuName: string) => {
    e.stopPropagation();
    setActiveMenu(prev => (prev === menuName ? null : menuName));
    setShowExportMenu(false);
  };

  const handleExportBBModel = () => {
    const json = exportBBModel(project);
    downloadFile(`${project.name.toLowerCase().replace(/\s+/g, '_')}.bbmodel`, json, 'application/json');
    setShowExportMenu(false);
  };

  const handleExportJava = () => {
    const json = exportJavaBlockModel(project);
    downloadFile(`${project.name.toLowerCase().replace(/\s+/g, '_')}.json`, json, 'application/json');
    setShowExportMenu(false);
  };

  const handleExportOBJ = () => {
    const obj = exportWavefrontOBJ(project);
    downloadFile(`${project.name.toLowerCase().replace(/\s+/g, '_')}.obj`, obj, 'text/plain');
    setShowExportMenu(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const imported = importProject(text);
        loadProject(imported);
      } catch (err: any) {
        alert('Could not parse project file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="h-10 bg-[#21252b] border-b border-[#181a1f] flex items-center justify-between px-3 select-none text-xs text-gray-300 relative z-30">
      {/* Hidden File Input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".bbmodel,.json,.obj"
        className="hidden"
      />

      {/* Left: Brand + File Menus */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-1.5 font-bold text-white tracking-wider cursor-pointer" onClick={onOpenAboutModal}>
          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[10px] font-black text-white shadow">
            B
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Blockbench</span>
        </div>

        {/* Menu Bar Dropdowns */}
        <div className="flex items-center gap-0.5">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={e => handleMenuClick(e, 'file')}
              className={`px-2 py-1 rounded transition hover:bg-[#2c313a] ${
                activeMenu === 'file' ? 'bg-[#2c313a] text-white' : ''
              }`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#21252b] border border-[#2c313a] rounded-md shadow-2xl py-1 text-gray-300 z-50">
                <button
                  onClick={() => { onOpenNewModal(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
                >
                  <span>New Model...</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+N</span>
                </button>
                <button
                  onClick={() => { fileInputRef.current?.click(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
                >
                  <span>Open Model (.bbmodel)...</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+O</span>
                </button>
                <div className="h-[1px] bg-[#2c313a] my-1" />
                <button
                  onClick={() => { handleExportBBModel(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
                >
                  <span>Save Project (.bbmodel)</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+S</span>
                </button>
                <div className="h-[1px] bg-[#2c313a] my-1" />
                <div className="px-3 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Presets
                </div>
                <button
                  onClick={() => { resetToPreset('creeper'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Creeper (Animated)
                </button>
                <button
                  onClick={() => { resetToPreset('chest'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Chest (Hinged Lid)
                </button>
                <button
                  onClick={() => { resetToPreset('block'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Minecraft Block
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={e => handleMenuClick(e, 'edit')}
              className={`px-2 py-1 rounded transition hover:bg-[#2c313a] ${
                activeMenu === 'edit' ? 'bg-[#2c313a] text-white' : ''
              }`}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#21252b] border border-[#2c313a] rounded-md shadow-2xl py-1 text-gray-300 z-50">
                <button
                  onClick={() => { undo(); setActiveMenu(null); }}
                  disabled={!canUndo}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between disabled:opacity-40"
                >
                  <span>Undo</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+Z</span>
                </button>
                <button
                  onClick={() => { redo(); setActiveMenu(null); }}
                  disabled={!canRedo}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between disabled:opacity-40"
                >
                  <span>Redo</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+Y</span>
                </button>
                <div className="h-[1px] bg-[#2c313a] my-1" />
                <button
                  onClick={() => { duplicateSelected(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
                >
                  <span>Duplicate</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+D</span>
                </button>
                <button
                  onClick={() => { deleteSelected(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-600 hover:text-white flex items-center justify-between"
                >
                  <span>Delete Selected</span>
                  <span className="text-gray-500 text-[10px]">Del</span>
                </button>
                <div className="h-[1px] bg-[#2c313a] my-1" />
                <button
                  onClick={() => { selectAll(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center justify-between"
                >
                  <span>Select All</span>
                  <span className="text-gray-500 text-[10px]">Ctrl+A</span>
                </button>
                <button
                  onClick={() => { deselectAll(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  Deselect All
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={e => handleMenuClick(e, 'help')}
              className={`px-2 py-1 rounded transition hover:bg-[#2c313a] ${
                activeMenu === 'help' ? 'bg-[#2c313a] text-white' : ''
              }`}
            >
              Help
            </button>
            {activeMenu === 'help' && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-[#21252b] border border-[#2c313a] rounded-md shadow-2xl py-1 text-gray-300 z-50">
                <button
                  onClick={() => { onOpenAboutModal(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white"
                >
                  About Blockbench
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Mode Switcher Tabs */}
      <div className="flex items-center bg-[#181a1f] p-0.5 rounded-lg border border-[#2c313a]">
        <button
          onClick={() => setMode('edit')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
            mode === 'edit'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#21252b]'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>

        <button
          onClick={() => setMode('paint')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
            mode === 'paint'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#21252b]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Paint</span>
        </button>

        <button
          onClick={() => setMode('animate')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
            mode === 'animate'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#21252b]'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Animate</span>
        </button>
      </div>

      {/* Right: Quick Actions & Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded hover:bg-[#2c313a] text-gray-400 hover:text-white disabled:opacity-30"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded hover:bg-[#2c313a] text-gray-400 hover:text-white disabled:opacity-30"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-[#2c313a] mx-1" />

        {/* Export Button */}
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setShowExportMenu(prev => !prev);
              setActiveMenu(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-[#21252b] border border-[#2c313a] rounded-md shadow-2xl py-1 text-gray-300 z-50">
              <button
                onClick={handleExportBBModel}
                className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <Box className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-medium text-xs">Blockbench Model</div>
                  <div className="text-[10px] text-gray-400">.bbmodel format</div>
                </div>
              </button>

              <button
                onClick={handleExportJava}
                className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <FileCode className="w-4 h-4 text-green-400" />
                <div>
                  <div className="font-medium text-xs">Minecraft Java Block/Item</div>
                  <div className="text-[10px] text-gray-400">.json model</div>
                </div>
              </button>

              <button
                onClick={handleExportOBJ}
                className="w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white flex items-center gap-2"
              >
                <FileBox className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-medium text-xs">Wavefront 3D OBJ</div>
                  <div className="text-[10px] text-gray-400">.obj format</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
