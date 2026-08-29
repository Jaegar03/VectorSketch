import { Circle, MousePointer2, Slash, Square } from "lucide-react";
import type { Dispatch, ReactNode } from "react";
import type { EditorAction } from "../../state/drawingReducer";
import type { Tool } from "../../state/types";

const tools: Array<{ tool: Tool; label: string; icon: ReactNode }> = [
  { tool: "select", label: "Select", icon: <MousePointer2 size={20} /> },
  { tool: "line", label: "Line", icon: <Slash size={20} /> },
  { tool: "rectangle", label: "Rectangle", icon: <Square size={20} /> },
  { tool: "circle", label: "Circle", icon: <Circle size={20} /> }
];

type Props = {
  activeTool: Tool;
  dispatch: Dispatch<EditorAction>;
};

export function ToolPalette({ activeTool, dispatch }: Props) {
  return (
    <aside className="tool-palette" aria-label="Drawing tools">
      {tools.map((item) => (
        <button
          key={item.tool}
          className={activeTool === item.tool ? "active" : ""}
          title={item.label}
          aria-label={item.label}
          aria-pressed={activeTool === item.tool}
          onClick={() => dispatch({ type: "setTool", tool: item.tool })}
        >
          {item.icon}
        </button>
      ))}
    </aside>
  );
}
