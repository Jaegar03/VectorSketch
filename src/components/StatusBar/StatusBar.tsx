import { memo } from "react";
import type { EditorState } from "../../state/types";
import { formatNumber } from "../../geometry/dimensions";

export const StatusBar = memo(function StatusBar({ state }: { state: EditorState }) {
  const cursor = state.cursorWorld ? `${formatNumber(state.cursorWorld.x)}, ${formatNumber(state.cursorWorld.y)}` : "-";
  return (
    <footer className="statusbar">
      <span>Tool: {state.activeTool}</span>
      <span>Cursor: {cursor}</span>
      <span>Zoom: {Math.round(state.viewport.scale * 100)}%</span>
      <span>Snap: {state.snapEnabled ? "On" : "Off"}</span>
    </footer>
  );
});
