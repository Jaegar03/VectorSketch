import type { Point, RectangleShape, Shape } from "../state/types";

export const MIN_SHAPE_SIZE = 2;

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function angleDegrees(a: Point, b: Point): number {
  const raw = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return (raw + 360) % 360;
}

export function normalizeRectangle(start: Point, end: Point): Omit<RectangleShape, "id" | "type"> {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  };
}

export function circleRadius(center: Point, edge: Point): number {
  return distance(center, edge);
}

export function isMeaningfulShape(shape: Shape): boolean {
  if (shape.type === "line") return distance({ x: shape.x1, y: shape.y1 }, { x: shape.x2, y: shape.y2 }) >= MIN_SHAPE_SIZE;
  if (shape.type === "rectangle") return shape.width >= MIN_SHAPE_SIZE && shape.height >= MIN_SHAPE_SIZE;
  return shape.r >= MIN_SHAPE_SIZE;
}

export function translateShape(shape: Shape, dx: number, dy: number): Shape {
  switch (shape.type) {
    case "line":
      return { ...shape, x1: shape.x1 + dx, y1: shape.y1 + dy, x2: shape.x2 + dx, y2: shape.y2 + dy };
    case "rectangle":
      return { ...shape, x: shape.x + dx, y: shape.y + dy };
    case "circle":
      return { ...shape, cx: shape.cx + dx, cy: shape.cy + dy };
  }
}

export function getShapeBounds(shape: Shape): { x: number; y: number; width: number; height: number } {
  switch (shape.type) {
    case "line": {
      const x = Math.min(shape.x1, shape.x2);
      const y = Math.min(shape.y1, shape.y2);
      return { x, y, width: Math.abs(shape.x2 - shape.x1), height: Math.abs(shape.y2 - shape.y1) };
    }
    case "rectangle":
      return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    case "circle":
      return { x: shape.cx - shape.r, y: shape.cy - shape.r, width: shape.r * 2, height: shape.r * 2 };
  }
}

export function shapeCenter(shape: Shape): Point {
  const bounds = getShapeBounds(shape);
  return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
}

export function shapeLabelPoint(shape: Shape): Point {
  if (shape.type === "line") return { x: (shape.x1 + shape.x2) / 2, y: (shape.y1 + shape.y2) / 2 - 14 };
  if (shape.type === "rectangle") return { x: shape.x + shape.width / 2, y: shape.y - 14 };
  return { x: shape.cx, y: shape.cy - shape.r - 14 };
}

export function shapeToDraft(type: Shape["type"], id: string, start: Point, current: Point): Shape {
  if (type === "line") return { id, type, x1: start.x, y1: start.y, x2: current.x, y2: current.y };
  if (type === "rectangle") return { id, type, ...normalizeRectangle(start, current) };
  return { id, type, cx: start.x, cy: start.y, r: circleRadius(start, current) };
}

export function isFiniteShape(shape: Shape): boolean {
  const values = shape.type === "line"
    ? [shape.x1, shape.y1, shape.x2, shape.y2]
    : shape.type === "rectangle"
      ? [shape.x, shape.y, shape.width, shape.height]
      : [shape.cx, shape.cy, shape.r];
  return values.every(Number.isFinite);
}

export function sameGeometry(a: Shape, b: Shape): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
