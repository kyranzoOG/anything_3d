# Blockbench (React Edition)

A low-poly 3D modeling, texturing, and animation workstation rewritten in React, TypeScript, and Three.js.

## Overview

Blockbench is a dedicated 3D voxel and box modeling editor engineered for Minecraft models, custom entity rigs, and low-poly art. This modern React edition preserves core workflows and features:

- **Interactive 3D Viewport**: WebGL rendering powered by Three.js with full Orbit controls (Rotate, Pan, Zoom), Minecraft-style ground grid, directional axes indicator, wireframe/shaded/textured display modes, and interactive 3D transform gizmos.
- **Three Core Modes**:
  - **Edit Mode**: Add, group, translate, rotate, scale cubes and bones, fine-tune origins/pivots and per-face UV maps.
  - **Paint Mode**: Real-time pixel painting directly on 3D meshes or on the 2D UV canvas with Brush, Eraser, Fill Bucket, and Eyedropper tools, adjustable brush sizes, and color palette swatches.
  - **Animate Mode**: Keyframe timeline with transport controls (Play, Pause, Scrub, Loop), channel tracks (Position, Rotation, Scale), and live real-time interpolated bone hierarchy playback.
- **Outliner Tree Panel**: Hierarchical tree with Groups/Bones and Cubes, folder expand/collapse, visibility eye toggles, lock toggles, and inline renaming.
- **Element Inspector**: Detailed voxel positioning, dimensions, origins, rotations, inflate, and per-face UV tables (North, South, East, West, Up, Down).
- **Import & Export**:
  - Export to `.bbmodel` (native Blockbench JSON)
  - Export to Minecraft Java Block / Item `.json`
  - Export to Wavefront `.obj` (3D standard mesh)
  - Import `.bbmodel`, `.json`, or `.obj` files
- **Built-in Presets**:
  - Animated Creeper with leg walking rig
  - Chest with opening lid hinge animation
  - 16x16 standard Minecraft block

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
