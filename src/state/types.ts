export type Point = { x: number; y: number };

export type Tool = "select" | "line" | "rectangle" | "circle";

export type LineShape = {
  id: string;
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type RectangleShape = {
  id: string;
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CircleShape = {
  id: string;
  type: "circle";
  cx: number;
  cy: number;
  r: number;
};

export type Shape = LineShape | RectangleShape | CircleShape;

export type Viewport = {
  offsetX: number;
  offsetY: number;
  scale: number;
};

export type InteractionMode =
  | { type: "idle" }
  | { type: "drawing"; start: Point }
  | { type: "dragging"; shapeId: string; origin: Point; original: Shape }
  | { type: "panning"; origin: Point; viewport: Viewport };

export type EditorSnapshot = {
  shapes: Shape[];
  selectedShapeId: string | null;
};

export type EditorState = EditorSnapshot & {
  activeTool: Tool;
  draftShape: Shape | null;
  viewport: Viewport;
  cursorWorld: Point | null;
  snapEnabled: boolean;
  interaction: InteractionMode;
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  importError: string | null;
};
