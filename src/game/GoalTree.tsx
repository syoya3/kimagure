"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { DetailedTree } from "./CityDetails";
import { useGame } from "./store";
import { useMobileQuality } from "./RenderQuality";

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,239,167,0.8)");
  gradient.addColorStop(0.35, "rgba(255,206,73,0.4)");
  gradient.addColorStop(1, "rgba(255,181,44,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** The company landmark behind Taiju; its footprint matches the existing collider. */
export function GoalTree() {
  const mobile = useMobileQuality();
  const showLabel = useGame(s => s.started && !s.dialogue);
  const glow = useMemo(glowTexture, []);
  const aura = useRef<THREE.SpriteMaterial>(null);
  const ripple = useRef<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>(null);
  useEffect(() => () => glow.dispose(), [glow]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (aura.current) aura.current.opacity = 0.38 + Math.sin(t * 0.8) * 0.06;
    if (ripple.current) {
      const phase = (t % 4.5) / 4.5;
      ripple.current.scale.setScalar(1 + phase * 0.35);
      ripple.current.material.opacity = Math.sin(phase * Math.PI) * 0.32;
    }
  });

  return <group position={[0, 0, -14]}>
    <mesh position-y={0.25} receiveShadow>
      <cylinderGeometry args={[3.2, 3.2, 0.5, 64]} />
      <meshStandardMaterial color="#e5d4a4" roughness={0.65} />
    </mesh>
    <mesh position-y={0.52} receiveShadow>
      <cylinderGeometry args={[2.85, 2.85, 0.07, 64]} />
      <meshStandardMaterial color="#92814b" roughness={0.9} />
    </mesh>
    <DetailedTree x={0} z={0} size={2.05} variant={2} golden />
    <mesh position-y={0.56} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[3.01, 3.13, 96]} />
      <meshStandardMaterial color="#ffe9a0" emissive="#ffc746" emissiveIntensity={1.4} toneMapped={false} />
    </mesh>
    <mesh position-y={0.12} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[11, 11]} />
      <meshBasicMaterial map={glow} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </mesh>
    <mesh ref={ripple} position-y={0.13} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[3.5, 3.54, 96]} />
      <meshBasicMaterial color="#ffcb52" transparent depthWrite={false} toneMapped={false} />
    </mesh>
    <sprite position={[0, 6.5, 0]} scale={[11.5, 11.5, 1]}>
      <spriteMaterial ref={aura} map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </sprite>
    <Sparkles count={mobile ? 24 : 55} position={[0, 5.7, 0]} scale={[8, 9, 7]} size={5} speed={0.35} opacity={0.85} color="#ffe599" noise={[0.3, 0.6, 0.3]} />
    {!mobile && <pointLight position={[0, 3, 1.4]} color="#ffca57" intensity={12} distance={9} decay={2} />}
    {showLabel && <Html center position={[0, 10.8, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div style={{ whiteSpace: "nowrap", textAlign: "center", padding: "8px 16px", borderRadius: 6, border: "1px solid #ffe39b", background: "linear-gradient(135deg, #514020ed, #282b25ed)", boxShadow: "0 0 24px #efc45155", color: "#fff0b9" }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.25em" }}>✦ GOAL ✦</div>
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3 }}>木まぐれの木</div>
      </div>
    </Html>}
  </group>;
}
