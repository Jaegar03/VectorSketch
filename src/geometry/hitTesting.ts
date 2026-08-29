import type { Point, Shape } from "../state/types";
import { distance } from "./geometry";

export function pointToSegmentDistance(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distance(point, a);
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
  return distance(point, { x: a.x + t * dx, y: a.y + t * dy });
}

export function pointInRectangle(point: Point, shape: { x: number; y: number; width: number; height: number }): boolean {
  return point.x >= shape.x && point.x <= shape.x + shape.width && point.y >= shape.y && point.y <= shape.y + shape.height;
}

export function pointInCircle(point: Point, shape: { cx: number; cy: number; r: number }): boolean {
  return distance(point, { x: shape.cx, y: shape.cy }) <= shape.r;
}

export function hitTestShape(shape: Shape, point: Point, tolerance: number): boolean {
  switch (shape.type) {
    case "line":
      return pointToSegmentDistance(point, { x: shape.x1, y: shape.y1 }, { x: shape.x2, y: shape.y2 }) <= tolerance;
    case "rectangle": {
      const inside = pointInRectangle(point, shape);
      const nearHorizontal = point.x >= shape.x - tolerance && point.x <= shape.x + shape.width + tolerance
        && (Math.abs(point.y - shape.y) <= tolerance || Math.abs(point.y - (shape.y + shape.height)) <= tolerance);
      const nearVertical = point.y >= shape.y - tolerance && point.y <= shape.y + shape.height + tolerance
        && (Math.abs(point.x - shape.x) <= tolerance || Math.abs(point.x - (shape.x + shape.width)) <= tolerance);
      return inside || nearHorizontal || nearVertical;
    }
    case "circle": {
      const d = distance(point, { x: shape.cx, y: shape.cy });
      return d <= shape.r || Math.abs(d - shape.r) <= tolerance;
    }
  }
}

export function hitTestShapes(shapes: Shape[], point: Point, tolerance: number): Shape | null {
  for (let i = shapes.length - 1; i >= 0; i -= 1) {
    if (hitTestShape(shapes[i], point, tolerance)) return shapes[i];
  }
  return null;
}
