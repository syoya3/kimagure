import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { MathUtils, Vector3, PerspectiveCamera } from "three";
import { useGame } from "./store";

export const MIN_CITY_ZOOM = 0.48;
export const MAX_CITY_ZOOM = 4.8;
export function zoomByWheel(current: number, delta: number) {
  return MathUtils.clamp(current * Math.exp(MathUtils.clamp(delta, -240, 240) * .0018), MIN_CITY_ZOOM, MAX_CITY_ZOOM);
}

export function useCityZoom() {
  const { gl, camera } = useThree();
  const zoom = useRef(1);
  const pan = useRef(new Vector3());
  const dragging = useRef(false);
  useEffect(() => {
    const canvas = gl.domElement;
    const previousTouchAction = canvas.style.touchAction;
    canvas.style.touchAction = "none";
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDistance = 0;
    let mouse: { id: number; x: number } | null = null;
    const previousCursor = canvas.style.cursor;
    canvas.style.cursor = "grab";
    const enabled = () => useGame.getState().started && !useGame.getState().dialogue;
    const wheel = (event: WheelEvent) => {
      if (!enabled()) return;
      if ((event.target as HTMLElement).closest("button,a,.dialogue,.objective")) return;
      const rect = canvas.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      event.preventDefault();
      const units = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1;
      zoom.current = zoomByWheel(zoom.current, event.deltaY * units);
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button === 0 && enabled()) {
        mouse = { id: e.pointerId, x: e.clientX }; dragging.current = true;
        canvas.style.cursor = "grabbing"; canvas.setPointerCapture(e.pointerId);
      }
      if (e.pointerType === "touch" && enabled()) { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); canvas.setPointerCapture(e.pointerId); } };
    const move = (e: PointerEvent) => {
      if (mouse?.id === e.pointerId && enabled()) {
        const distance = (window.innerWidth < 700 ? 42 : 33) * zoom.current;
        const fov = camera instanceof PerspectiveCamera ? camera.fov : 40;
        const units = 2 * distance * Math.tan(MathUtils.degToRad(fov / 2)) / canvas.clientHeight;
        const displacement = -(e.clientX - mouse.x) * units;
        const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
        right.y = 0; right.normalize();
        pan.current.addScaledVector(right, displacement).clampLength(0, 65);
        mouse.x = e.clientX;
      }
      if (!pointers.has(e.pointerId) || !enabled()) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size !== 2) return;
      const [a, b] = [...pointers.values()], distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDistance > 0 && distance > 0) zoom.current = MathUtils.clamp(zoom.current * pinchDistance / distance, MIN_CITY_ZOOM, MAX_CITY_ZOOM);
      pinchDistance = distance;
    };
    const up = (e: PointerEvent) => {
      if (mouse?.id === e.pointerId) { mouse = null; dragging.current = false; canvas.style.cursor = "grab"; }
      pointers.delete(e.pointerId); pinchDistance = 0;
    };
    const blur = () => { mouse = null; dragging.current = false; pointers.clear(); pinchDistance = 0; canvas.style.cursor = "grab"; };
    window.addEventListener("blur", blur);
    window.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("pointerdown", down); window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    return () => {
      canvas.style.touchAction = previousTouchAction;
      canvas.style.cursor = previousCursor;
      window.removeEventListener("blur", blur);
      window.removeEventListener("wheel", wheel);
      canvas.removeEventListener("pointerdown", down); window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
    };
  }, [gl, camera]);
  return { zoom, pan, dragging };
}
