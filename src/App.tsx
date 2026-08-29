import { useCallback, useReducer, useState } from "react";
import { CanvasView } from "./components/Canvas/CanvasView";
import { PropertiesPanel } from "./components/PropertiesPanel/PropertiesPanel";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { ToolPalette } from "./components/Toolbar/ToolPalette";
import { TopBar } from "./components/Toolbar/TopBar";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { drawingReducer, initialEditorState } from "./state/drawingReducer";

export function App() {
  const [state, dispatch] = useReducer(drawingReducer, initialEditorState);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const handleSizeChange = useCallback((size: { width: number; height: number }) => setCanvasSize(size), []);
  useKeyboardShortcuts(dispatch);

  return (
    <div className="app-shell">
      <TopBar state={state} dispatch={dispatch} canvasSize={canvasSize} />
      <main className="workspace">
        <ToolPalette activeTool={state.activeTool} dispatch={dispatch} />
        <CanvasView state={state} dispatch={dispatch} onSizeChange={handleSizeChange} />
        <PropertiesPanel state={state} dispatch={dispatch} />
      </main>
      <StatusBar state={state} />
    </div>
  );
}
