import React, { useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Repeat,
  Plus,
  Key,
  Film,
  Trash2,
} from 'lucide-react';

export const TimelinePanel: React.FC = () => {
  const {
    project,
    mode,
    activeAnimationId,
    setActiveAnimationId,
    addAnimation,
    playheadTime,
    setPlayheadTime,
    isPlaying,
    setIsPlaying,
    selectedElementIds,
    setKeyframe,
  } = useProject();

  const rulerRef = useRef<HTMLDivElement>(null);

  if (mode !== 'animate') return null;

  const currentAnim =
    project.animations.find(a => a.id === activeAnimationId) || project.animations[0];

  const animLength = currentAnim ? currentAnim.length : 2.0;

  // Handle clicking or dragging on timeline ruler
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setPlayheadTime(ratio * animLength);
  };

  const handleCreateNewAnim = () => {
    const name = prompt('Animation name:', `anim_${project.animations.length + 1}`);
    if (name) addAnimation(name);
  };

  // Find all animated bones/cubes in current anim
  const animatedNodeIds = currentAnim ? Object.keys(currentAnim.animators) : [];

  return (
    <div className="h-48 bg-[#21252b] border-t border-[#181a1f] flex flex-col select-none text-xs text-gray-300">
      {/* Timeline Controls Header */}
      <div className="h-9 px-3 bg-[#1e2227] border-b border-[#181a1f] flex items-center justify-between">
        {/* Left: Animation Dropdown & Transport */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={activeAnimationId || ''}
              onChange={e => {
                setActiveAnimationId(e.target.value);
                setPlayheadTime(0);
              }}
              className="bg-[#282c34] text-white rounded px-2 py-0.5 border border-[#3e4451] outline-none text-xs font-medium"
            >
              {project.animations.map(anim => (
                <option key={anim.id} value={anim.id}>
                  {anim.name} ({anim.length}s)
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateNewAnim}
              className="p-1 hover:bg-[#2c313a] text-blue-400 rounded"
              title="Add New Animation"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-[#333842] mx-1" />

          {/* Transport Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPlayheadTime(0)}
              className="p-1 rounded hover:bg-[#2c313a] text-gray-400 hover:text-white"
              title="Jump to Start"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-0.5 rounded flex items-center gap-1 font-medium transition ${
                isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              onClick={() => setPlayheadTime(animLength)}
              className="p-1 rounded hover:bg-[#2c313a] text-gray-400 hover:text-white"
              title="Jump to End"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center / Right: Time readout & Loop indicator */}
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Position:</span>
            <span className="text-blue-400 font-bold bg-[#181a1f] px-2 py-0.5 rounded border border-[#2c313a]">
              {playheadTime.toFixed(2)}s / {animLength.toFixed(2)}s
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <Repeat className="w-3.5 h-3.5 text-blue-400" />
            <span>Loop: ON</span>
          </div>
        </div>
      </div>

      {/* Scrubber Time Ruler */}
      <div
        ref={rulerRef}
        onClick={handleRulerClick}
        className="h-6 bg-[#181a1f] border-b border-[#2c313a] relative cursor-pointer select-none overflow-hidden"
      >
        {/* Time Ticks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const t = (i / 10) * animLength;
          const leftPercent = (i / 10) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 flex flex-col justify-between text-[9px] text-gray-500 font-mono pointer-events-none"
              style={{ left: `${leftPercent}%` }}
            >
              <span className="pl-0.5">{t.toFixed(1)}s</span>
              <div className="w-[1px] h-2 bg-[#333842]" />
            </div>
          );
        })}

        {/* Playhead Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
          style={{ left: `${(playheadTime / animLength) * 100}%` }}
        >
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full -ml-1 -mt-0.5 shadow" />
        </div>
      </div>

      {/* Track List & Keyframes Display */}
      <div className="flex-1 overflow-y-auto">
        {animatedNodeIds.length > 0 ? (
          animatedNodeIds.map(nodeId => {
            const nodeAnim = currentAnim?.animators[nodeId];
            if (!nodeAnim) return null;

            // Find group or cube name
            const group = project.groups.find(g => g.id === nodeId);
            const cube = project.cubes.find(c => c.id === nodeId);
            const nodeName = group ? group.name : cube ? cube.name : nodeId;

            return (
              <div key={nodeId} className="border-b border-[#181a1f] flex items-center h-8">
                {/* Node Label */}
                <div className="w-48 px-3 text-xs font-medium truncate text-gray-300 bg-[#1e2227] h-full flex items-center border-r border-[#181a1f]">
                  {nodeName}
                </div>

                {/* Track timeline area */}
                <div
                  className="flex-1 h-full relative bg-[#21252b] cursor-pointer hover:bg-[#252a32]"
                  onClick={handleRulerClick}
                >
                  {/* Rotation Keyframe Diamonds */}
                  {nodeAnim.rotation &&
                    nodeAnim.rotation.map((kf, idx) => {
                      const posPct = (kf.time / animLength) * 100;
                      return (
                        <div
                          key={`rot_${idx}`}
                          onClick={e => {
                            e.stopPropagation();
                            setPlayheadTime(kf.time);
                          }}
                          title={`Rotation Keyframe at ${kf.time.toFixed(2)}s: [${kf.value.join(', ')}]`}
                          className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-amber-400 rotate-45 border border-black/40 hover:scale-125 transition z-20 cursor-pointer shadow"
                          style={{ left: `${posPct}%` }}
                        />
                      );
                    })}

                  {/* Playhead line overlay */}
                  <div
                    className="absolute top-0 bottom-0 w-[1px] bg-blue-500/50 pointer-events-none"
                    style={{ left: `${(playheadTime / animLength) * 100}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 italic text-xs py-4">
            <Key className="w-5 h-5 mb-1 opacity-40 text-blue-400" />
            <span>No keyframe tracks in this animation. Select an element and click "+ Keyframe" to animate!</span>
          </div>
        )}
      </div>
    </div>
  );
};
