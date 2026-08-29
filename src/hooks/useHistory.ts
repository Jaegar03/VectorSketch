import type { EditorState } from "../state/types";

export function useHistoryAvailability(state: EditorState): { canUndo: boolean; canRedo: boolean } {
  return { canUndo: state.past.length > 0, canRedo: state.future.length > 0 };
}
