"use client";

import dynamic from "next/dynamic";

// WebGL/Three.js はクライアント専用。SSRを無効化して読み込む。
const Experience = dynamic(() => import("@/game/Experience"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "#0a0f16",
        color: "#ddc527",
        fontWeight: 900,
        letterSpacing: ".1em",
      }}
    >
      LOADING…
    </div>
  ),
});

export default function Home() {
  return <Experience />;
}
