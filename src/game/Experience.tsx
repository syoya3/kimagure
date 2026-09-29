"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import Hud from "./Hud";

export default function Experience() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ("ontouchstart" in window) document.body.classList.add("touch");
    setReady(true);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0f16", overflow: "hidden" }}>
      {ready && (
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [49, 56, 66], fov: 40, near: 0.1, far: 450 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <Scene />
        </Canvas>
      )}
      <Hud />
    </div>
  );
}
