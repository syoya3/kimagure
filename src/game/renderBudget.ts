export const MOBILE_FPS = 30;
export const MOBILE_DPR = 1.25;

// Preserve elapsed time when a display refresh does not line up with 30 Hz.
export function frameDue(now: number, previous: number, interval: number) {
  const elapsed = now - previous;
  return elapsed + 0.1 >= interval ? previous + Math.floor((elapsed + 0.1) / interval) * interval : null;
}

export function lowerDpr(dpr: number, fps: number) {
  return fps < 24 ? Math.max(0.85, Math.round((dpr - 0.2) * 100) / 100) : dpr;
}
