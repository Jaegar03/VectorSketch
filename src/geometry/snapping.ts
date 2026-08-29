import type { Point } from "../state/types";

export const GRID_SIZE = 10;

export function snapPoint(point: Point, gridSize = GRID_SIZE): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  };
}
