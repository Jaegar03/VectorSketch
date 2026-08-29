import type { Shape } from "../state/types";
import { angleDegrees, distance } from "./geometry";

export function formatNumber(value: number, digits = 2): string {
  return value.toFixed(digits);
}

export function getLineDimensions(shape: Extract<Shape, { type: "line" }>): { length: number; angle: number; label: string } {
  const length = distance({ x: shape.x1, y: shape.y1 }, { x: shape.x2, y: shape.y2 });
  const angle = angleDegrees({ x: shape.x1, y: shape.y1 }, { x: shape.x2, y: shape.y2 });
  return { length, angle, label: `${formatNumber(length)} px / ${formatNumber(angle, 1)} deg` };
}

export function getRectangleDimensions(shape: Extract<Shape, { type: "rectangle" }>): { width: number; height: number; label: string } {
  return { width: shape.width, height: shape.height, label: `${formatNumber(shape.width)} x ${formatNumber(shape.height)} px` };
}

export function getCircleDimensions(shape: Extract<Shape, { type: "circle" }>): { radius: number; diameter: number; label: string } {
  return { radius: shape.r, diameter: shape.r * 2, label: `R ${formatNumber(shape.r)} px` };
}

export function getShapeDimensions(shape: Shape): string {
  if (shape.type === "line") return getLineDimensions(shape).label;
  if (shape.type === "rectangle") return getRectangleDimensions(shape).label;
  return getCircleDimensions(shape).label;
}
