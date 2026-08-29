import type { Point, Viewport } from "../state/types";

export function screenToWorld(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.offsetX) / viewport.scale,
    y: (point.y - viewport.offsetY) / viewport.scale
  };
}

export function worldToScreen(point: Point, viewport: Viewport): Point {
  return {
    x: point.x * viewport.scale + viewport.offsetX,
    y: point.y * viewport.scale + viewport.offsetY
  };
}

export function zoomViewport(viewport: Viewport, screenPoint: Point, nextScale: number): Viewport {
  const scale = Math.max(0.2, Math.min(5, nextScale));
  const worldBefore = screenToWorld(screenPoint, viewport);
  return {
    scale,
    offsetX: screenPoint.x - worldBefore.x * scale,
    offsetY: screenPoint.y - worldBefore.y * scale
  };
}
