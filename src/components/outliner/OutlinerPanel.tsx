import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  Folder,
  FolderOpen,
  Box,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  FolderPlus,
  Trash2,
  Copy,
  Search,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { CubeElement, GroupElement } from '../../types/model';

export const OutlinerPanel: React.FC = () => {
  const {
    project,
    selectedElementIds,
    selectElement,
    addCube,
    addGroup,
    duplicateSelected,
    deleteSelected,
    updateCube,
    updateGroup,
  } = useProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Handle inline rename
  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const submitRename = () => {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (trimmed) {
      if (project.cubes.find(c => c.id === editingId)) {
        updateCube(editingId, { name: trimmed });
      } else if (project.groups.find(g => g.id === editingId)) {
        updateGroup(editingId, { name: trimmed });
      }
    }
    setEditingId(null);
  };

  // Filter elements
  const filteredCubes = project.cubes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGroups = project.groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 h-full bg-[#21252b] border-l border-[#181a1f] flex flex-col select-none text-xs text-gray-300">
      {/* Panel Header */}
      <div className="h-8 px-3 border-b border-[#181a1f] flex items-center justify-between font-semibold text-gray-200">
        <span>OUTLINER</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => addCube()}
            className="p-1 hover:bg-[#2c313a] text-blue-400 rounded"
            title="Add Cube"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => addGroup()}
            className="p-1 hover:bg-[#2c313a] text-amber-400 rounded"
            title="Add Bone / Group"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={duplicateSelected}
            disabled={selectedElementIds.length === 0}
            className="p-1 hover:bg-[#2c313a] text-gray-400 hover:text-white rounded disabled:opacity-30"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={deleteSelected}
            disabled={selectedElementIds.length === 0}
            className="p-1 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded disabled:opacity-30"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-[#181a1f]">
        <div className="flex items-center bg-[#181a1f] rounded px-2 py-1 gap-1.5 border border-[#2c313a]">
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search outliner..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-gray-200 focus:outline-none placeholder-gray-500"
          />
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {/* Render Groups and their child cubes */}
        {filteredGroups.map(group => {
          const isSelected = selectedElementIds.includes(group.id);
          const childCubes = filteredCubes.filter(c => c.groupId === group.id);
          const isOpen = group.isOpen !== false;

          return (
            <div key={group.id} className="space-y-0.5">
              {/* Group Node */}
              <div
                onClick={e => selectElement(group.id, e.ctrlKey || e.metaKey)}
                onDoubleClick={() => startRename(group.id, group.name)}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer group transition ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-[#2c313a] text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      updateGroup(group.id, { isOpen: !isOpen });
                    }}
                    className="p-0.5 hover:text-white"
                  >
                    {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>

                  {isOpen ? (
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}

                  {editingId === group.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={e => e.key === 'Enter' && submitRename()}
                      autoFocus
                      className="bg-black/50 text-white px-1 rounded text-xs w-28 outline-none border border-blue-400"
                    />
                  ) : (
                    <span className="truncate font-medium">{group.name}</span>
                  )}
                </div>

                {/* Visibility & Lock Icons */}
                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      updateGroup(group.id, { visibility: !group.visibility });
                    }}
                    className="hover:text-white"
                    title="Toggle Visibility"
                  >
                    {group.visibility ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-gray-500" />}
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      updateGroup(group.id, { locked: !group.locked });
                    }}
                    className="hover:text-white"
                    title="Toggle Lock"
                  >
                    {group.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 opacity-40 hover:opacity-100" />}
                  </button>
                </div>
              </div>

              {/* Child Cubes */}
              {isOpen && childCubes.map(cube => {
                const isCubeSelected = selectedElementIds.includes(cube.id);

                return (
                  <div
                    key={cube.id}
                    onClick={e => selectElement(cube.id, e.ctrlKey || e.metaKey)}
                    onDoubleClick={() => startRename(cube.id, cube.name)}
                    className={`flex items-center justify-between pl-7 pr-2 py-1 rounded cursor-pointer group transition ${
                      isCubeSelected
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-[#2c313a] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Box
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: cube.color || '#4a90e2' }}
                      />

                      {editingId === cube.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onBlur={submitRename}
                          onKeyDown={e => e.key === 'Enter' && submitRename()}
                          autoFocus
                          className="bg-black/50 text-white px-1 rounded text-xs w-28 outline-none border border-blue-400"
                        />
                      ) : (
                        <span className="truncate">{cube.name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateCube(cube.id, { visibility: !cube.visibility });
                        }}
                        className="hover:text-white"
                        title="Toggle Visibility"
                      >
                        {cube.visibility ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-gray-500" />}
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateCube(cube.id, { locked: !cube.locked });
                        }}
                        className="hover:text-white"
                        title="Toggle Lock"
                      >
                        {cube.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 opacity-40 hover:opacity-100" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Top level unassigned cubes */}
        {filteredCubes
          .filter(c => !c.groupId || !project.groups.find(g => g.id === c.groupId))
          .map(cube => {
            const isCubeSelected = selectedElementIds.includes(cube.id);

            return (
              <div
                key={cube.id}
                onClick={e => selectElement(cube.id, e.ctrlKey || e.metaKey)}
                onDoubleClick={() => startRename(cube.id, cube.name)}
                className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer group transition ${
                  isCubeSelected
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-[#2c313a] text-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <Box
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: cube.color || '#4a90e2' }}
                  />

                  {editingId === cube.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={submitRename}
                      onKeyDown={e => e.key === 'Enter' && submitRename()}
                      autoFocus
                      className="bg-black/50 text-white px-1 rounded text-xs w-28 outline-none border border-blue-400"
                    />
                  ) : (
                    <span className="truncate">{cube.name}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      updateCube(cube.id, { visibility: !cube.visibility });
                    }}
                    className="hover:text-white"
                  >
                    {cube.visibility ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-gray-500" />}
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      updateCube(cube.id, { locked: !cube.locked });
                    }}
                    className="hover:text-white"
                  >
                    {cube.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 opacity-40 hover:opacity-100" />}
                  </button>
                </div>
              </div>
            );
          })}

        {filteredCubes.length === 0 && filteredGroups.length === 0 && (
          <div className="text-center text-gray-500 py-6 text-xs italic">
            No elements found
          </div>
        )}
      </div>
    </div>
  );
};
