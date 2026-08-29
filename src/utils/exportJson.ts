import type { Shape } from "../state/types";

export type VectorSketchDocument = {
  version: 1;
  shapes: Shape[];
};

export function serializeDrawing(shapes: Shape[]): string {
  const document: VectorSketchDocument = {
    version: 1,
    shapes: shapes.map((shape) => ({ ...shape }))
  };
  return JSON.stringify(document, null, 2);
}

export function downloadText(filename: string, text: string, type = "application/json"): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
