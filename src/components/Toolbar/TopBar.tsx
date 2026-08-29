import { Download, FileDown, FileUp, Redo2, RotateCcw, Trash2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import type { Dispatch } from "react";
import type { EditorAction } from "../../state/drawingReducer";
import type { EditorState } from "../../state/types";
import { zoomViewport } from "../../geometry/transforms";
import { downloadText, serializeDrawing } from "../../utils/exportJson";
import { parseDrawingJson } from "../../utils/importJson";
import { exportPng } from "../../utils/exportPng";

type Props = {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
  canvasSize: { width: number; height: number };
};

export function TopBar({ state, dispatch, canvasSize }: Props) {
  const importFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const { shapes } = parseDrawingJson(await file.text());
      dispatch({ type: "replaceShapes", shapes });
      dispatch({ type: "setImportError", message: null });
    } catch (error) {
      dispatch({ type: "setImportError", message: error instanceof Error ? error.message : "Import failed." });
    }
  };

  const zoomBy = (factor: number) => {
    dispatch({
      type: "setViewport",
      viewport: zoomViewport(state.viewport, { x: canvasSize.width / 2, y: canvasSize.height / 2 }, state.viewport.scale * factor)
    });
  };

  return (
    <header className="topbar">
      <div className="brand">VectorSketch</div>
      <div className="top-actions">
        <button title="Undo" aria-label="Undo" disabled={!state.past.length} onClick={() => dispatch({ type: "undo" })}><Undo2 size={18} /></button>
        <button title="Redo" aria-label="Redo" disabled={!state.future.length} onClick={() => dispatch({ type: "redo" })}><Redo2 size={18} /></button>
        <label className="icon-button" title="Import JSON" aria-label="Import JSON">
          <FileUp size={18} />
          <input type="file" accept="application/json,.json" onChange={(event) => void importFile(event.currentTarget.files?.[0])} />
        </label>
        <button title="Export JSON" aria-label="Export JSON" onClick={() => downloadText("vectorsketch.json", serializeDrawing(state.shapes))}><FileDown size={18} /></button>
        <button title="Export PNG" aria-label="Export PNG" onClick={() => exportPng(state, canvasSize.width, canvasSize.height)}><Download size={18} /></button>
        <span className="divider" />
        <button title="Zoom out" aria-label="Zoom out" onClick={() => zoomBy(0.9)}><ZoomOut size={18} /></button>
        <button title="Zoom in" aria-label="Zoom in" onClick={() => zoomBy(1.1)}><ZoomIn size={18} /></button>
        <button title="Reset zoom" aria-label="Reset zoom" onClick={() => dispatch({ type: "setViewport", viewport: { offsetX: 0, offsetY: 0, scale: 1 } })}><RotateCcw size={18} /></button>
        <button title="Delete selected" aria-label="Delete selected" disabled={!state.selectedShapeId} onClick={() => dispatch({ type: "deleteSelected" })}><Trash2 size={18} /></button>
      </div>
    </header>
  );
}
