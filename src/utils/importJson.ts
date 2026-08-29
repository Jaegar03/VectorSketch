import { isFiniteShape } from "../geometry/geometry";
import type { Shape } from "../state/types";
import { createId } from "./id";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numberField(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function parseDrawingJson(text: string): { shapes: Shape[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }
  if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.shapes)) {
    throw new Error("Expected a VectorSketch document with version 1 and a shapes array.");
  }
  const shapes = parsed.shapes.map((shape, index): Shape => {
    if (!isRecord(shape) || typeof shape.type !== "string") throw new Error(`Shape ${index + 1} is malformed.`);
    const id = typeof shape.id === "string" ? shape.id : createId("imported");
    if (shape.type === "line" && numberField(shape.x1) && numberField(shape.y1) && numberField(shape.x2) && numberField(shape.y2)) {
      return { id, type: "line", x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 };
    }
    if (shape.type === "rectangle" && numberField(shape.x) && numberField(shape.y) && numberField(shape.width) && numberField(shape.height)) {
      if (shape.width < 0 || shape.height < 0) throw new Error(`Shape ${index + 1} has negative rectangle dimensions.`);
      return { id, type: "rectangle", x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    }
    if (shape.type === "circle" && numberField(shape.cx) && numberField(shape.cy) && numberField(shape.r)) {
      if (shape.r < 0) throw new Error(`Shape ${index + 1} has a negative radius.`);
      return { id, type: "circle", cx: shape.cx, cy: shape.cy, r: shape.r };
    }
    throw new Error(`Shape ${index + 1} has an unsupported type or invalid geometry.`);
  });
  if (!shapes.every(isFiniteShape)) throw new Error("Imported geometry contains invalid numeric values.");
  return { shapes };
}
