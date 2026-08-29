import { Trash2 } from "lucide-react";
import type { Dispatch } from "react";
import { getShapeDimensions, formatNumber } from "../../geometry/dimensions";
import type { EditorAction } from "../../state/drawingReducer";
import type { EditorState, Shape } from "../../state/types";

function rows(shape: Shape): Array<[string, string]> {
  if (shape.type === "line") {
    return [["X1", formatNumber(shape.x1)], ["Y1", formatNumber(shape.y1)], ["X2", formatNumber(shape.x2)], ["Y2", formatNumber(shape.y2)], ["Dimensions", getShapeDimensions(shape)]];
  }
  if (shape.type === "rectangle") {
    return [["X", formatNumber(shape.x)], ["Y", formatNumber(shape.y)], ["Width", formatNumber(shape.width)], ["Height", formatNumber(shape.height)]];
  }
  return [["CX", formatNumber(shape.cx)], ["CY", formatNumber(shape.cy)], ["Radius", formatNumber(shape.r)], ["Diameter", formatNumber(shape.r * 2)]];
}

type Props = {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
};

export function PropertiesPanel({ state, dispatch }: Props) {
  const selected = state.shapes.find((shape) => shape.id === state.selectedShapeId);
  return (
    <aside className="properties-panel">
      <div className="panel-section">
        <h2>Properties</h2>
        {selected ? (
          <>
            <div className="selected-type">{selected.type}</div>
            <dl>
              {rows(selected).map(([label, value]) => (
                <div key={label} className="property-row">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <button className="delete-button" onClick={() => dispatch({ type: "deleteSelected" })}>
              <Trash2 size={16} /> Delete
            </button>
          </>
        ) : (
          <p className="muted">No shape selected.</p>
        )}
      </div>
      <div className="panel-section">
        <h2>Document</h2>
        <div className="property-row"><dt>Shapes</dt><dd>{state.shapes.length}</dd></div>
        <label className="toggle-row">
          <input type="checkbox" checked={state.snapEnabled} onChange={() => dispatch({ type: "toggleSnap" })} />
          Snap to grid
        </label>
        {state.importError ? <div className="error-box">{state.importError}</div> : null}
      </div>
    </aside>
  );
}
