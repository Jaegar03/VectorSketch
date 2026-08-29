import type { EditorState } from "../state/types";
import { renderScene } from "../components/Canvas/renderScene";

export function exportPng(state: EditorState, width: number, height: number): void {
  const canvas = document.createElement("canvas");
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, width * scale);
  canvas.height = Math.max(1, height * scale);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);
  renderScene(ctx, state, { width, height, exportMode: true });
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "vectorsketch.png";
  link.click();
}
