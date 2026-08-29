# VectorSketch

## Overview

VectorSketch is a coding-assignment implementation of a compact 2D drawing tool built with React, TypeScript, Vite, and the raw HTML Canvas 2D API. It focuses on geometry correctness, predictable editor state, and a clean CAD-inspired interface.

No drawing/canvas library was used.

## Features

Core requirements:

- Draw lines, rectangles, and circles with live previews.
- Show live dimensions while drawing.
- Select, move, highlight, and delete shapes.
- Export all geometry as documented JSON.
- Keep shapes in world coordinates with screen/canvas/world transforms.

Bonus features:

- JSON import with validation and graceful errors.
- PNG export.
- Undo and redo for meaningful edits.
- Persistent dimension annotations.
- Grid snapping toggle.
- Mouse-wheel zoom around cursor and Space-drag panning.
- Keyboard shortcuts.

## Tech Stack

- React
- TypeScript
- Vite
- HTML Canvas 2D
- CSS
- Vitest

## Architecture

State lives in a reducer in `src/state/drawingReducer.ts`. Persisted shapes, selection, viewport, history, draft shape, and interaction mode are explicitly modeled. Draft geometry is separate from finalized geometry.

Rendering is centralized in `src/components/Canvas/renderScene.ts` with a pipeline for background, grid, shapes, draft shape, dimensions, and selection. React owns UI controls; Canvas owns pixels.

Geometry utilities live in `src/geometry`. Hit testing, coordinate transforms, dimensions, snapping, bounds, and shape translation are independently testable.

## Geometry

Line length uses `sqrt(dx^2 + dy^2)`. Line angle uses `atan2(dy, dx)` in degrees.

Rectangles normalize drag direction using min coordinates and absolute width/height.

Circles are center-origin shapes; radius is the distance from center to cursor.

Line hit testing uses point-to-segment distance. Rectangles check interior and border tolerance. Circles compare point distance to radius.

## Interaction Model

Drawing starts on pointer down, updates a draft shape on pointer move, and commits on pointer up if the geometry is meaningful.

Selection uses geometry-based hit testing from top-most shape to bottom-most. Dragging captures the original shape and translates it by world-space deltas.

Zoom is cursor-centered via `screenToWorld` and `worldToScreen`. Pan changes viewport offsets while shapes remain unchanged in world coordinates. Snapping rounds world coordinates to the grid.

## Data Model

Exported JSON schema:

```json
{
  "version": 1,
  "shapes": [
    {
      "id": "shape-1",
      "type": "line",
      "x1": 40,
      "y1": 60,
      "x2": 220,
      "y2": 140
    }
  ]
}
```

Shape variants:

- Line: `type`, `x1`, `y1`, `x2`, `y2`
- Rectangle: `type`, `x`, `y`, `width`, `height`
- Circle: `type`, `cx`, `cy`, `r`

IDs are preserved to keep imports stable, but geometry is plain numeric world-coordinate data.

## Keyboard Shortcuts

- `V`: Select
- `L`: Line
- `R`: Rectangle
- `C`: Circle
- `Delete` / `Backspace`: Delete selected shape
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Ctrl/Cmd + Y`: Redo
- `Escape`: Cancel current drawing
- `Space + drag`: Pan

## Running Locally

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
npm run build
```

## Design Decisions

- World coordinates are the single source of truth, so zoom and pan do not corrupt geometry.
- History records shape creation, deletion, import, and completed movement, not every pointer move.
- Canvas rendering is a pure-ish pass from editor state to pixels.
- Import validation rejects malformed documents before updating the drawing.
- The UI stays compact so the drawing workspace remains primary.

## Known Limitations

- Selection handles are visual only; resizing is not implemented.
- Fit-to-content is represented by reset zoom rather than an automatic fit algorithm.
- Touch support uses pointer events but has not been deeply optimized for mobile drawing.
- PNG export captures the current viewport rather than the full world bounds.

## What I Would Improve With More Time

- Add resize handles and shape editing.
- Add marquee selection and multi-select.
- Add fit-to-content and export full drawing bounds.
- Add alignment guides and angle snapping.
- Add end-to-end interaction tests with Playwright.
