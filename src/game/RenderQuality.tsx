"use client";

import { createContext, useContext, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { frameDue, lowerDpr, MOBILE_FPS } from "./renderBudget";
import { clearInput } from "./input";

export const MobileQuality = createContext(false);
export const useMobileQuality = () => useContext(MobileQuality);

export function mobileDevice() {
  // Stable for this Canvas lifetime, including rotation; never load both asset tiers.
  if (process.env.NODE_ENV === "development") {
    const override = new URLSearchParams(window.location.search).get("quality");
    if (override) return override === "mobile";
  }
  return window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 1;
}

export function RenderBudget() {
  const mobile = useMobileQuality();
  const { advance, gl, clock, setDpr } = useThree();
  useEffect(() => {
    let handle = 0, previous = 0, renderedAt = 0, elapsed = clock.elapsedTime;
    let windowStart = 0, frames = 0, samples = 0, dpr = gl.getPixelRatio();
    let slowWindows = 0, totalFrames = 0;
    const interval = 1000 / (mobile ? MOBILE_FPS : 60);
    const tick = (now: number) => {
      handle = requestAnimationFrame(tick);
      if (!previous) previous = now - interval;
      const due = frameDue(now, previous, interval);
      if (due === null) return;
      previous = due;
      elapsed += renderedAt ? Math.min((now - renderedAt) / 1000, 0.1) : interval / 1000;
      renderedAt = now;
      advance(elapsed);
      frames++;
      totalFrames++;
      if (!windowStart) windowStart = now;
      if (now - windowStart >= 3000) {
        const fps = frames * 1000 / (now - windowStart);
        // Ignore initial asset/shader startup; only reduce after sustained pressure.
        if (++samples > 2 && mobile) {
          slowWindows = fps < 24 ? slowWindows + 1 : 0;
          if (slowWindows >= 2) { dpr = lowerDpr(dpr, fps); setDpr(dpr); slowWindows = 0; }
        }
        if (process.env.NODE_ENV === "development") gl.domElement.dataset.renderStats = JSON.stringify({
          mobile, fps: +fps.toFixed(1), dpr, seconds: +elapsed.toFixed(1), totalFrames, calls: gl.info.render.calls, triangles: gl.info.render.triangles,
          geometries: gl.info.memory.geometries, textures: gl.info.memory.textures,
        });
        frames = 0; windowStart = now;
      }
    };
    const visibility = () => {
      cancelAnimationFrame(handle);
      clearInput();
      previous = renderedAt = windowStart = frames = slowWindows = 0;
      if (!document.hidden) handle = requestAnimationFrame(tick);
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(handle); document.removeEventListener("visibilitychange", visibility); };
  }, [mobile, advance, gl, clock, setDpr]);
  return null;
}
