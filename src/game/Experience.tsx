"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Hud from "./Hud";

// Only WebGL needs the browser. Keep the company introduction and links in SSR HTML.
const CampusCanvas = dynamic(() => import("./CampusCanvas"), { ssr: false });

export default function Experience() {
  useEffect(() => {
    if ("ontouchstart" in window) document.body.classList.add("touch");
    return () => document.body.classList.remove("touch");
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0f16", overflow: "hidden" }}>
      <CampusCanvas />
      <Hud />
    </div>
  );
}
