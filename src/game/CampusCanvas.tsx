"use client";

import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import Scene from "./Scene";
import { MobileQuality, mobileDevice, RenderBudget } from "./RenderQuality";
import { MOBILE_DPR } from "./renderBudget";

export default function CampusCanvas() {
  const [mobile] = useState(mobileDevice);
  return (
    <MobileQuality.Provider value={mobile}>
      <Canvas
        shadows
        frameloop="never"
        dpr={mobile ? MOBILE_DPR : [1, 1.5]}
        camera={{ position: [49, 56, 66], fov: 40, near: 0.1, far: 450 }}
        gl={{ antialias: !mobile, powerPreference: mobile ? "default" : "high-performance" }}
        onCreated={({ gl }) => { gl.shadowMap.autoUpdate = !mobile; gl.shadowMap.needsUpdate = true; }}
      >
        <RenderBudget />
        <Scene />
      </Canvas>
    </MobileQuality.Provider>
  );
}
