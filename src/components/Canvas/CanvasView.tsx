import { useEffect, useRef } from "react";
import type { Dispatch } from "react";
import { renderScene } from "./renderScene";
import { useCanvasResize } from "../../hooks/useCanvasResize";
import { useDrawingInteraction } from "../../hooks/useDrawingInteraction";
import type { EditorAction } from "../../state/drawingReducer";
import type { EditorState } from "../../state/types";

type Props = {
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
  onSizeChange: (size: { width: number; height: number }) => void;
};

export function CanvasView({ state, dispatch, onSizeChange }: Props) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const size = useCanvasResize(frameRef);
  const handlers = useDrawingInteraction(canvasRef, state, dispatch);

  useEffect(() => onSizeChange(size), [onSizeChange, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(size.width * dpr);
    canvas.height = Math.floor(size.height * dpr);
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = requestAnimationFrame(() => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderScene(ctx, state, size);
    });
    return () => cancelAnimationFrame(frame);
  }, [size, state]);

  return (
    <div className="canvas-frame" ref={frameRef}>
      <canvas
        ref={canvasRef}
        className={`drawing-canvas ${state.interaction.type === "panning" ? "is-panning" : ""}`}
        onPointerDown={handlers.onPointerDown}
        onPointerMove={handlers.onPointerMove}
        onPointerUp={handlers.onPointerUp}
        onPointerCancel={handlers.onPointerUp}
        onWheel={handlers.onWheel}
        aria-label="VectorSketch drawing canvas"
      />
      {state.shapes.length === 0 && !state.draftShape ? (
        <div className="empty-state" aria-hidden="true">
          <h2>Start drawing</h2>
          <p>Choose a tool and drag on the canvas</p>
          <div>V Select | L Line | R Rectangle | C Circle | Space Pan</div>
        </div>
      ) : null}
    </div>
  );
}
