import type { EditorSnapshot, EditorState, InteractionMode, Point, Shape, Tool, Viewport } from "./types";

export type EditorAction =
  | { type: "setTool"; tool: Tool }
  | { type: "setDraft"; shape: Shape | null }
  | { type: "setCursor"; point: Point | null }
  | { type: "setInteraction"; interaction: InteractionMode }
  | { type: "setViewport"; viewport: Viewport }
  | { type: "toggleSnap" }
  | { type: "select"; shapeId: string | null }
  | { type: "commitShape"; shape: Shape }
  | { type: "updateShape"; shape: Shape; commit?: boolean }
  | { type: "deleteSelected" }
  | { type: "replaceShapes"; shapes: Shape[] }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "setImportError"; message: string | null };

export const initialViewport: Viewport = { offsetX: 0, offsetY: 0, scale: 1 };

export const initialEditorState: EditorState = {
  shapes: [],
  selectedShapeId: null,
  activeTool: "select",
  draftShape: null,
  viewport: initialViewport,
  cursorWorld: null,
  snapEnabled: false,
  interaction: { type: "idle" },
  past: [],
  future: [],
  importError: null
};

function snapshot(state: EditorState): EditorSnapshot {
  return { shapes: state.shapes, selectedShapeId: state.selectedShapeId };
}

function withHistory(state: EditorState, next: EditorSnapshot): EditorState {
  return {
    ...state,
    ...next,
    past: [...state.past, snapshot(state)].slice(-80),
    future: [],
    importError: null
  };
}

export function drawingReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "setTool":
      return { ...state, activeTool: action.tool, draftShape: null, interaction: { type: "idle" }, selectedShapeId: action.tool === "select" ? state.selectedShapeId : null };
    case "setDraft":
      return { ...state, draftShape: action.shape };
    case "setCursor":
      return { ...state, cursorWorld: action.point };
    case "setInteraction":
      return { ...state, interaction: action.interaction };
    case "setViewport":
      return { ...state, viewport: action.viewport };
    case "toggleSnap":
      return { ...state, snapEnabled: !state.snapEnabled };
    case "select":
      return { ...state, selectedShapeId: action.shapeId, activeTool: "select" };
    case "commitShape":
      return withHistory(state, { shapes: [...state.shapes, action.shape], selectedShapeId: action.shape.id });
    case "updateShape": {
      const shapes = state.shapes.map((shape) => (shape.id === action.shape.id ? action.shape : shape));
      return action.commit ? withHistory(state, { shapes, selectedShapeId: action.shape.id }) : { ...state, shapes, selectedShapeId: action.shape.id };
    }
    case "deleteSelected":
      if (!state.selectedShapeId) return state;
      return withHistory(state, { shapes: state.shapes.filter((shape) => shape.id !== state.selectedShapeId), selectedShapeId: null });
    case "replaceShapes":
      return withHistory(state, { shapes: action.shapes, selectedShapeId: null });
    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return { ...state, ...previous, past: state.past.slice(0, -1), future: [snapshot(state), ...state.future], draftShape: null, interaction: { type: "idle" } };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return { ...state, ...next, past: [...state.past, snapshot(state)], future: state.future.slice(1), draftShape: null, interaction: { type: "idle" } };
    }
    case "setImportError":
      return { ...state, importError: action.message };
  }
}
