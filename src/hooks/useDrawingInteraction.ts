import { RefObject, useCallback, useEffect, useRef } from "react";
import type { Dispatch } from "react";
import { hitTestShapes } from "../geometry/hitTesting";
import { isMeaningfulShape, sameGeometry, shapeToDraft, translateShape } from "../geometry/geometry";
import { snapPoint } from "../geometry/snapping";
import { screenToWorld, zoomViewport } from "../geometry/transforms";
import type { EditorAction } from "../state/drawingReducer";
import type { EditorState, Point } from "../state/types";
import { createId } from "../utils/id";

function eventPoint(event: { clientX: number; clientY: number }, canvas: HTMLCanvasElement): Point {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

export function useDrawingInteraction(canvasRef: RefObject<HTMLCanvasElement | null>, state: EditorState, dispatch: Dispatch<EditorAction>) {
  const stateRef = useRef(state);
  const spacePressed = useRef(false);
  stateRef.current = state;

  const getRawWorldPoint = useCallback((event: PointerEvent | React.PointerEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return screenToWorld(eventPoint(event, canvas), stateRef.current.viewport);
  }, [canvasRef]);

  const getWorldPoint = useCallback((event: PointerEvent | React.PointerEvent): Point | null => {
    const raw = getRawWorldPoint(event);
    if (!raw) return null;
    return stateRef.current.snapEnabled ? snapPoint(raw) : raw;
  }, [getRawWorldPoint]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rawWorld = getRawWorldPoint(event);
    const world = getWorldPoint(event);
    if (!canvas || !rawWorld || !world) return;
    canvas.setPointerCapture(event.pointerId);
    if (spacePressed.current || event.button === 1) {
      dispatch({ type: "setInteraction", interaction: { type: "panning", origin: eventPoint(event, canvas), viewport: stateRef.current.viewport } });
      return;
    }
    if (stateRef.current.activeTool === "select") {
      const hit = hitTestShapes(stateRef.current.shapes, rawWorld, 8 / stateRef.current.viewport.scale);
      if (hit) {
        dispatch({ type: "select", shapeId: hit.id });
        dispatch({ type: "setInteraction", interaction: { type: "dragging", shapeId: hit.id, origin: world, original: hit } });
      } else {
        dispatch({ type: "select", shapeId: null });
      }
      return;
    }
    const draft = shapeToDraft(stateRef.current.activeTool, createId(), world, world);
    dispatch({ type: "setDraft", shape: draft });
    dispatch({ type: "setInteraction", interaction: { type: "drawing", start: world } });
  }, [canvasRef, dispatch, getRawWorldPoint, getWorldPoint]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const world = getWorldPoint(event);
    if (!canvas || !world) return;
    dispatch({ type: "setCursor", point: world });
    const interaction = stateRef.current.interaction;
    if (interaction.type === "drawing" && stateRef.current.activeTool !== "select") {
      dispatch({ type: "setDraft", shape: shapeToDraft(stateRef.current.activeTool, stateRef.current.draftShape?.id ?? createId(), interaction.start, world) });
    } else if (interaction.type === "dragging") {
      dispatch({ type: "updateShape", shape: translateShape(interaction.original, world.x - interaction.origin.x, world.y - interaction.origin.y) });
    } else if (interaction.type === "panning") {
      const point = eventPoint(event, canvas);
      dispatch({
        type: "setViewport",
        viewport: {
          ...interaction.viewport,
          offsetX: interaction.viewport.offsetX + point.x - interaction.origin.x,
          offsetY: interaction.viewport.offsetY + point.y - interaction.origin.y
        }
      });
    }
  }, [canvasRef, dispatch, getWorldPoint]);

  const onPointerUp = useCallback(() => {
    const interaction = stateRef.current.interaction;
    if (interaction.type === "drawing" && stateRef.current.draftShape) {
      if (isMeaningfulShape(stateRef.current.draftShape)) dispatch({ type: "commitShape", shape: stateRef.current.draftShape });
      dispatch({ type: "setDraft", shape: null });
    } else if (interaction.type === "dragging") {
      const current = stateRef.current.shapes.find((shape) => shape.id === interaction.shapeId);
      if (current && !sameGeometry(current, interaction.original)) dispatch({ type: "updateShape", shape: current, commit: true });
    }
    dispatch({ type: "setInteraction", interaction: { type: "idle" } });
  }, [dispatch]);

  const onWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const current = stateRef.current.viewport;
    const nextScale = current.scale * (event.deltaY > 0 ? 0.9 : 1.1);
    dispatch({ type: "setViewport", viewport: zoomViewport(current, eventPoint(event, canvas), nextScale) });
  }, [canvasRef, dispatch]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        spacePressed.current = true;
        event.preventDefault();
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "Space") spacePressed.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onWheel };
}
