import { useEffect } from "react";
import type { Dispatch } from "react";
import type { EditorAction } from "../state/drawingReducer";

function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  return !!element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.isContentEditable);
}

export function useKeyboardShortcuts(dispatch: Dispatch<EditorAction>): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? "redo" : "undo" });
      } else if ((event.metaKey || event.ctrlKey) && key === "y") {
        event.preventDefault();
        dispatch({ type: "redo" });
      } else if (key === "delete" || key === "backspace") {
        dispatch({ type: "deleteSelected" });
      } else if (key === "escape") {
        dispatch({ type: "setDraft", shape: null });
        dispatch({ type: "setInteraction", interaction: { type: "idle" } });
      } else if (key === "v") dispatch({ type: "setTool", tool: "select" });
      else if (key === "l") dispatch({ type: "setTool", tool: "line" });
      else if (key === "r") dispatch({ type: "setTool", tool: "rectangle" });
      else if (key === "c") dispatch({ type: "setTool", tool: "circle" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch]);
}
