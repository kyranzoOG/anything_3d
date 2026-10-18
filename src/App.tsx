import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { TopMenuBar } from './components/toolbar/TopMenuBar';
import { ModeToolbar } from './components/toolbar/ModeToolbar';
import { ThreeViewport } from './components/viewport/ThreeViewport';
import { OutlinerPanel } from './components/outliner/OutlinerPanel';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { TexturePanel } from './components/texture/TexturePanel';
import { TimelinePanel } from './components/animation/TimelinePanel';
import { StatusBar } from './components/statusbar/StatusBar';
import { NewProjectModal } from './components/dialogs/NewProjectModal';
import { AboutModal } from './components/dialogs/AboutModal';

const WorkbenchWorkspace: React.FC = () => {
  const {
    mode,
    activeTool,
    setActiveTool,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    isPlaying,
    setIsPlaying,
  } = useProject();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'w') {
        setActiveTool('translate');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('rotate');
      } else if (e.key.toLowerCase() === 'r') {
        setActiveTool('scale');
      } else if (e.key === ' ' && mode === 'animate') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected, duplicateSelected, setActiveTool, mode, isPlaying, setIsPlaying]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#181a1f] text-gray-200">
      {/* Top Menu Bar */}
      <TopMenuBar
        onOpenNewModal={() => setIsNewModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
      />

      {/* Mode Toolbar */}
      <ModeToolbar />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Texture & UV Mapping (in Edit & Paint modes) */}
        {showLeftSidebar && (mode === 'paint' || mode === 'edit') && (
          <aside className="h-full z-10 shrink-0">
            <TexturePanel />
          </aside>
        )}

        {/* Center: 3D Three.js Viewport */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#181a1f]">
          <ThreeViewport />
        </main>

        {/* Right Sidebar: Outliner & Properties */}
        <aside className="h-full flex z-10 shrink-0">
          <OutlinerPanel />
          <PropertiesPanel />
        </aside>
      </div>

      {/* Bottom Animation Timeline (in Animate Mode) */}
      {mode === 'animate' && <TimelinePanel />}

      {/* Bottom Status Bar */}
      <StatusBar />

      {/* Dialog Modals */}
      <NewProjectModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <WorkbenchWorkspace />
    </ProjectProvider>
  );
}
