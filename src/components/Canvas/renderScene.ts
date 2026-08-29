import { getShapeBounds, shapeLabelPoint } from "../../geometry/geometry";
import { GRID_SIZE } from "../../geometry/snapping";
import { worldToScreen } from "../../geometry/transforms";
import type { EditorState, Shape } from "../../state/types";
import { getShapeDimensions } from "../../geometry/dimensions";

type RenderOptions = { width: number; height: number; exportMode?: boolean };

function applyWorld(ctx: CanvasRenderingContext2D, state: EditorState): void {
  ctx.translate(state.viewport.offsetX, state.viewport.offsetY);
  ctx.scale(state.viewport.scale, state.viewport.scale);
}

function renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = "#f7f8fa";
  ctx.fillRect(0, 0, width, height);
}

function renderGrid(ctx: CanvasRenderingContext2D, state: EditorState, width: number, height: number): void {
  const spacing = GRID_SIZE * state.viewport.scale;
  if (spacing < 4) return;
  const startX = state.viewport.offsetX % spacing;
  const startY = state.viewport.offsetY % spacing;
  ctx.save();
  ctx.strokeStyle = "#dfe4ea";
  ctx.lineWidth = 1;
  ctx.globalAlpha = state.snapEnabled ? 0.72 : 0.42;
  for (let x = startX; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = startY; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function renderShape(ctx: CanvasRenderingContext2D, shape: Shape, selected: boolean, draft = false): void {
  ctx.save();
  ctx.strokeStyle = selected ? "#0b6fba" : draft ? "#2f8dd8" : "#26313d";
  ctx.lineWidth = selected ? 2.5 : 1.8;
  ctx.setLineDash(draft ? [6, 5] : []);
  ctx.fillStyle = draft ? "rgba(47, 141, 216, 0.08)" : "rgba(33, 43, 54, 0.04)";
  if (shape.type === "line") {
    ctx.beginPath();
    ctx.moveTo(shape.x1, shape.y1);
    ctx.lineTo(shape.x2, shape.y2);
    ctx.stroke();
  } else if (shape.type === "rectangle") {
    ctx.beginPath();
    ctx.rect(shape.x, shape.y, shape.width, shape.height);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function renderDimensions(ctx: CanvasRenderingContext2D, state: EditorState, shape: Shape, strong = false): void {
  const label = getShapeDimensions(shape);
  const screen = worldToScreen(shapeLabelPoint(shape), state.viewport);
  ctx.save();
  ctx.font = strong ? "12px Inter, system-ui, sans-serif" : "11px Inter, system-ui, sans-serif";
  const padding = 6;
  const width = ctx.measureText(label).width + padding * 2;
  const height = 22;
  const x = Math.max(8, Math.min(screen.x - width / 2, ctx.canvas.clientWidth - width - 8));
  const y = Math.max(8, screen.y - height / 2);
  ctx.fillStyle = strong ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.82)";
  ctx.strokeStyle = strong ? "#0b6fba" : "#c6d1dc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = strong ? "#0a4f86" : "#536273";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + width / 2, y + height / 2);
  ctx.restore();
}

function renderSelection(ctx: CanvasRenderingContext2D, shape: Shape): void {
  const bounds = getShapeBounds(shape);
  ctx.save();
  ctx.strokeStyle = "#0b6fba";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
  ctx.setLineDash([]);
  const handles = [
    [bounds.x - 5, bounds.y - 5],
    [bounds.x + bounds.width + 5, bounds.y - 5],
    [bounds.x + bounds.width + 5, bounds.y + bounds.height + 5],
    [bounds.x - 5, bounds.y + bounds.height + 5]
  ];
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#0b6fba";
  for (const [x, y] of handles) {
    ctx.beginPath();
    ctx.rect(x - 3, y - 3, 6, 6);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export function renderScene(ctx: CanvasRenderingContext2D, state: EditorState, options: RenderOptions): void {
  renderBackground(ctx, options.width, options.height);
  renderGrid(ctx, state, options.width, options.height);

  ctx.save();
  applyWorld(ctx, state);
  for (const shape of state.shapes) renderShape(ctx, shape, state.selectedShapeId === shape.id && !options.exportMode);
  if (state.draftShape && !options.exportMode) renderShape(ctx, state.draftShape, false, true);
  if (!options.exportMode) {
    const selected = state.shapes.find((shape) => shape.id === state.selectedShapeId);
    if (selected) renderSelection(ctx, selected);
  }
  ctx.restore();

  if (!options.exportMode) {
    for (const shape of state.shapes) renderDimensions(ctx, state, shape, state.selectedShapeId === shape.id);
    if (state.draftShape) renderDimensions(ctx, state, state.draftShape, true);
  } else {
    for (const shape of state.shapes) renderDimensions(ctx, state, shape);
  }
}
