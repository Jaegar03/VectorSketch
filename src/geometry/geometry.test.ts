import { describe, expect, it } from "vitest";
import { angleDegrees, circleRadius, distance, normalizeRectangle, translateShape } from "./geometry";
import { hitTestShape, pointToSegmentDistance } from "./hitTesting";
import { snapPoint } from "./snapping";
import { screenToWorld, worldToScreen, zoomViewport } from "./transforms";
import { parseDrawingJson } from "../utils/importJson";
import { serializeDrawing } from "../utils/exportJson";
import type { Shape } from "../state/types";
import { drawingReducer, initialEditorState } from "../state/drawingReducer";

describe("geometry", () => {
  it("calculates line distance", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it("calculates normalized line angle in [0, 360) deg", () => {
    expect(angleDegrees({ x: 0, y: 0 }, { x: 0, y: 10 })).toBe(90);
    expect(angleDegrees({ x: 0, y: 0 }, { x: 0, y: -10 })).toBe(270);
  });

  it("normalizes rectangles drawn in any direction", () => {
    expect(normalizeRectangle({ x: 20, y: 30 }, { x: 5, y: 10 })).toEqual({ x: 5, y: 10, width: 15, height: 20 });
  });

  it("calculates circle radius", () => {
    expect(circleRadius({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(5);
  });

  it("calculates point to line segment distance", () => {
    expect(pointToSegmentDistance({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(3);
  });

  it("hit tests rectangles", () => {
    expect(hitTestShape({ id: "r", type: "rectangle", x: 10, y: 10, width: 40, height: 20 }, { x: 20, y: 20 }, 4)).toBe(true);
  });

  it("hit tests circles", () => {
    expect(hitTestShape({ id: "c", type: "circle", cx: 10, cy: 10, r: 5 }, { x: 14, y: 10 }, 2)).toBe(true);
  });

  it("translates shapes without changing dimensions", () => {
    expect(translateShape({ id: "l", type: "line", x1: 0, y1: 0, x2: 10, y2: 10 }, 5, -2)).toEqual({
      id: "l",
      type: "line",
      x1: 5,
      y1: -2,
      x2: 15,
      y2: 8
    });
  });

  it("round trips screen and world coordinates", () => {
    const viewport = { offsetX: 20, offsetY: -10, scale: 2 };
    const world = { x: 15, y: 25 };
    expect(screenToWorld(worldToScreen(world, viewport), viewport)).toEqual(world);
  });

  it("zooms around the cursor", () => {
    const viewport = { offsetX: 0, offsetY: 0, scale: 1 };
    const cursor = { x: 100, y: 100 };
    const next = zoomViewport(viewport, cursor, 2);
    expect(worldToScreen(screenToWorld(cursor, viewport), next)).toEqual(cursor);
  });

  it("snaps points to a grid", () => {
    expect(snapPoint({ x: 14, y: 26 }, 10)).toEqual({ x: 10, y: 30 });
  });
});

describe("serialization", () => {
  it("exports and imports a drawing document", () => {
    const shapes: Shape[] = [
      { id: "l", type: "line", x1: 0, y1: 0, x2: 10, y2: 10 },
      { id: "r", type: "rectangle", x: 5, y: 6, width: 20, height: 30 },
      { id: "c", type: "circle", cx: 10, cy: 10, r: 8 }
    ];
    expect(parseDrawingJson(serializeDrawing(shapes)).shapes).toEqual(shapes);
  });

  it("deduplicates duplicate IDs on import", () => {
    const json = JSON.stringify({
      version: 1,
      shapes: [
        { id: "dup", type: "circle", cx: 0, cy: 0, r: 10 },
        { id: "dup", type: "circle", cx: 20, cy: 20, r: 10 }
      ]
    });
    const parsed = parseDrawingJson(json);
    expect(parsed.shapes[0].id).not.toBe(parsed.shapes[1].id);
  });

  it("rejects malformed json", () => {
    expect(() => parseDrawingJson("{ nope")).toThrow("valid JSON");
  });

  it("rejects invalid shape types", () => {
    expect(() => parseDrawingJson(JSON.stringify({ version: 1, shapes: [{ type: "triangle" }] }))).toThrow("unsupported type");
  });
});

describe("reducer history & interactions", () => {
  it("correctly records undo state when dragging shape", () => {
    const initial: Shape = { id: "rect", type: "rectangle", x: 0, y: 0, width: 20, height: 20 };
    let state = drawingReducer(initialEditorState, { type: "commitShape", shape: initial });
    state = drawingReducer(state, { type: "setInteraction", interaction: { type: "dragging", shapeId: "rect", origin: { x: 0, y: 0 }, original: initial } });
    
    const moved: Shape = { id: "rect", type: "rectangle", x: 50, y: 50, width: 20, height: 20 };
    state = drawingReducer(state, { type: "updateShape", shape: moved, commit: false });
    state = drawingReducer(state, { type: "updateShape", shape: moved, commit: true });
    state = drawingReducer(state, { type: "setInteraction", interaction: { type: "idle" } });

    expect(state.shapes[0]).toEqual(moved);

    // Undo should restore pre-drag initial shape
    state = drawingReducer(state, { type: "undo" });
    expect(state.shapes[0]).toEqual(initial);

    // Redo should restore moved shape
    state = drawingReducer(state, { type: "redo" });
    expect(state.shapes[0]).toEqual(moved);
  });

  it("reverts drag modifications when interaction is canceled", () => {
    const initial: Shape = { id: "rect", type: "rectangle", x: 0, y: 0, width: 20, height: 20 };
    let state = drawingReducer(initialEditorState, { type: "commitShape", shape: initial });
    state = drawingReducer(state, { type: "setInteraction", interaction: { type: "dragging", shapeId: "rect", origin: { x: 0, y: 0 }, original: initial } });
    
    const moved: Shape = { id: "rect", type: "rectangle", x: 50, y: 50, width: 20, height: 20 };
    state = drawingReducer(state, { type: "updateShape", shape: moved, commit: false });

    // Cancel interaction (Escape key)
    state = drawingReducer(state, { type: "cancelInteraction" });
    expect(state.shapes[0]).toEqual(initial);
    expect(state.interaction.type).toBe("idle");
  });
});
