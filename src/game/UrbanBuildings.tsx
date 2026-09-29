"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Boxes, CafeTable, DetailedTree, type BoxPart } from "./CityDetails";

export type BuildingLot = { x: number; z: number; w: number; d: number; h: number };

function Sign({ text, subtitle, width = 5, color = "#ece7d3", background = "#254746", y, z }: { text: string; subtitle?: string; width?: number; color?: string; background?: string; y: number; z: number }) {
  const map = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 256;
    const ctx = c.getContext("2d")!; ctx.fillStyle = background; ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = color; ctx.textAlign = "center"; ctx.font = "500 84px Georgia"; ctx.fillText(text, 512, subtitle ? 122 : 155);
    if (subtitle) { ctx.font = "24px sans-serif"; ctx.fillText(subtitle, 512, 190); }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; return tex;
  }, [text, subtitle, color, background]);
  useEffect(() => () => map.dispose(), [map]);
  return <mesh position={[0, y, z]}><planeGeometry args={[width, width / 4]} /><meshStandardMaterial map={map} roughness={0.7} /></mesh>;
}

function WindowGrid({ w, d, height, start = 1, columns = 5, floors = 5, tint = "#486b75", frame = "#d2d6cd" }: { w: number; d: number; height: number; start?: number; columns?: number; floors?: number; tint?: string; frame?: string }) {
  const panes: BoxPart[] = [], bars: BoxPart[] = [];
  for (const side of [-1, 1]) {
    for (let floor = 0; floor < floors; floor++) for (let col = 0; col < columns; col++) {
      const y = start + (floor + 0.5) * height / floors;
      panes.push({ p: [-w / 2 + (col + 0.5) * w / columns, y, side * (d / 2 + 0.02)], s: [w / columns * 0.72, height / floors * 0.63, 0.06] });
      panes.push({ p: [side * (w / 2 + 0.02), y, -d / 2 + (col + 0.5) * d / columns], s: [0.06, height / floors * 0.63, d / columns * 0.72] });
    }
    for (let floor = 0; floor < floors; floor++) {
      bars.push({ p: [0, start + floor * height / floors + 0.15, side * (d / 2 + 0.13)], s: [w, 0.1, 0.26] });
    }
  }
  return <><Boxes color={tint} metal={0.45} parts={panes} /><Boxes color={frame} parts={bars} /></>;
}

function Shop({ lot, bistro }: { lot: BuildingLot; bistro?: boolean }) {
  const { w, d } = lot, h = bistro ? 6.8 : 9.2;
  const brick = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 256;
    const ctx = c.getContext("2d")!; ctx.fillStyle = "#d1bdb0"; ctx.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 16; y++) for (let x = -1; x < 5; x++) {
      ctx.fillStyle = ["#966957", "#a77860", "#b5866a", "#8c6350"][(x + y + 8) % 4];
      ctx.fillRect(x * 64 + (y % 2) * 32 + 1, y * 16 + 1, 61, 13);
    }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 2); return tex;
  }, []);
  useEffect(() => () => brick.dispose(), [brick]);
  return <group position={[lot.x, 0.15, lot.z]} rotation-y={bistro ? -Math.PI / 2 : Math.PI / 2}>
    <Boxes color="#ddd9c9" parts={[{ p: [0, 0.08, 1], s: [w + 1.6, 0.2, d + 5.5] }, { p: [0, h + 0.2, 0], s: [w + 0.45, 0.4, d + 0.45] }]} />
    <Boxes color={bistro ? "#e8dfcb" : "#ffffff"} map={bistro ? undefined : brick} parts={[{ p: [0, h / 2, 0], s: [w, h, d] }]} />
    <WindowGrid w={w} d={d} height={h - 3.1} start={3.1} floors={bistro ? 1 : 2} columns={bistro ? 3 : 4} tint={bistro ? "#3d675f" : "#3e5357"} frame={bistro ? "#bcbca4" : "#8c9a97"} />
    <Boxes color="#2b4b50" metal={0.35} parts={[-1, 0, 1].map(s => ({ p: [s * w * 0.28, 1.45, d / 2 + 0.07], s: [w * 0.25, 2.7, 0.08] }))} />
    <Boxes color={bistro ? "#36564a" : "#233e41"} parts={[-1, 1].map(s => ({ p: [s * w * 0.45, 1.55, d / 2 + 0.17], s: [0.18, 3.1, 0.2] }))} />
    <Sign text={bistro ? "BISTRO / ROOTS" : "KOMOREBI"} subtitle={bistro ? "SEASONAL KITCHEN & WINE" : "COFFEE ROASTERS · EST. 2024"} width={w * 0.83} y={3.02} z={d / 2 + 0.21} background={bistro ? "#36564a" : "#243a3c"} />
    <Boxes color={bistro ? "#596e4b" : "#bb9c72"} parts={[{ p: [0, 2.7, d / 2 + 0.85], s: [w * 0.91, 0.1, 1.7], r: [0.16, 0, 0] }, { p: [0, 2.48, d / 2 + 1.63], s: [w * 0.91, 0.33, 0.06] }]} />
    <Boxes color="#e6dfc3" parts={Array.from({ length: 9 }, (_, i) => ({ p: [-w * 0.4 + i * w * 0.1, 2.76, d / 2 + 0.85], s: [w * 0.04, 0.025, 1.7], r: [0.16, 0, 0] }))} />
    <CafeTable x={-2.2} z={d / 2 + 2.3} /><CafeTable x={2.2} z={d / 2 + 2.3} />
    <Boxes color="#384b43" parts={[{ p: [0, h + 0.55, -d / 2 + 0.15], s: [w, 0.65, 0.18] }, { p: [-w / 2, h + 0.55, 0], s: [0.18, 0.65, d] }, { p: [w / 2, h + 0.55, 0], s: [0.18, 0.65, d] }]} />
    <Boxes color="#778d62" parts={[{ p: [0, h + 0.44, 0], s: [w - 0.6, 0.08, d - 0.6] }]} />
    <group position={[0, h + 0.46, 0]}><DetailedTree x={-w * 0.28} z={-d * 0.25} size={0.48} /><CafeTable x={w * 0.22} z={0} /></group>
    <mesh position={[w / 2 + 0.6, 0.72, d / 2 + 1.2]} rotation-x={-0.12}><boxGeometry args={[0.75, 1.25, 0.08]} /><meshStandardMaterial color="#2b4140" /></mesh>
    <Boxes color="#a07750" parts={[{ p: [w / 2 + 0.6, 1.4, d / 2 + 1.2], s: [0.85, 0.08, 0.1] }]} />
  </group>;
}

function CourtyardOffice({ lot, terrace }: { lot: BuildingLot; terrace?: boolean }) {
  const { w, h, d } = lot;
  return <group position={[lot.x, 0.16, lot.z]}>
    <Boxes color={terrace ? "#d9cfb9" : "#e0e1d8"} parts={[{ p: [0, h / 2, 0], s: [w, h, d] }]} />
    <WindowGrid w={w} d={d} height={h - 3} start={2.5} floors={Math.floor(h / 3)} columns={terrace ? 3 : 5} tint={terrace ? "#4d6964" : "#466873"} />
    <Boxes color={terrace ? "#b3a992" : "#eeeeE3"} parts={Array.from({ length: 6 }, (_, i) => ({ p: [-w / 2 + i * w / 5, h / 2, d / 2 + 0.23], s: [0.3, h, 0.42] }))} />
    <Boxes color="#c3ccbd" parts={[{ p: [0, h + 0.12, 0], s: [w + 0.3, 0.25, d + 0.3] }, { p: [0, 2.6, d / 2 + 0.8], s: [w, 0.18, 1.7] }]} />
    <Boxes color="#3f625c" metal={0.3} parts={[{ p: [0, 1.25, d / 2 + 0.02], s: [w - 1, 2.3, 0.1] }]} />
    {terrace && <group position={[0, h + 0.25, -d * 0.2]}>
      <Boxes color="#ede9da" parts={[{ p: [0, 2, 0], s: [w * 0.68, 4, d * 0.55] }]} />
      <WindowGrid w={w * 0.68} d={d * 0.55} height={3} floors={1} columns={3} />
      <DetailedTree x={-w * 0.3} z={d * 0.4} size={0.6} />
      <DetailedTree x={w * 0.3} z={d * 0.4} size={0.5} />
    </group>}
    {!terrace && <Boxes color="#67845f" parts={[{ p: [0, h + 0.29, 0], s: [w - 0.9, 0.1, d - 0.9] }]} />}
    <Sign text={terrace ? "ATELIER 03" : "NEXUS LAB"} width={w * 0.62} y={3.15} z={d / 2 + 0.5} />
  </group>;
}

function RoundTower({ lot }: { lot: BuildingLot }) {
  const { w, d, h } = lot;
  return <group position={[lot.x, 0.15, lot.z]}>
    <mesh position-y={h / 2} castShadow receiveShadow><cylinderGeometry args={[w * 0.43, w * 0.5, h, 32]} /><meshStandardMaterial color="#577c87" metalness={0.5} roughness={0.26} /></mesh>
    {Array.from({ length: 9 }, (_, i) => <mesh key={i} position-y={i * h / 8 + 0.1} castShadow><cylinderGeometry args={[w * (0.5 - i * 0.009) + 0.15, w * (0.5 - i * 0.009) + 0.15, 0.14, 32]} /><meshStandardMaterial color="#c4d0cd" metalness={0.45} /></mesh>)}
    <Boxes color="#b2c3bf" metal={0.5} parts={Array.from({ length: 20 }, (_, i) => {
      const a = i * Math.PI / 10;
      return { p: [Math.sin(a) * w * 0.468, h / 2, Math.cos(a) * w * 0.468], s: [0.09, h, 0.1], r: [Math.sin(a) * -0.026, 0, Math.cos(a) * 0.026] };
    })} />
    <Boxes color="#d2d8cf" parts={[{ p: [0, 0.3, 0], s: [w + 1, 0.6, d + 1] }, { p: [0, 2.5, d / 2], s: [5, 0.2, 2.5] }]} />
    <mesh position-y={h + 0.55}><cylinderGeometry args={[w * 0.25, w * 0.25, 1, 32]} /><meshStandardMaterial color="#455a63" /></mesh>
    <Sign text="ORBIT" subtitle="WORKSPACE" width={4} y={3.6} z={d / 2 + 0.1} />
  </group>;
}

function FinTower({ lot }: { lot: BuildingLot }) {
  const { w, h, d } = lot;
  return <group position={[lot.x, 0.15, lot.z]}>
    <Boxes color="#253d4a" metal={0.45} parts={[{ p: [0, h / 2, 0], s: [w, h, d] }]} />
    <WindowGrid w={w} d={d} height={h - 2} start={1.5} floors={7} columns={5} tint="#5d7d85" frame="#526267" />
    <Boxes color="#a17e50" metal={0.45} parts={[-1, 1].flatMap(s => Array.from({ length: 13 }, (_, i) => ({ p: [-w / 2 + i * w / 12, h / 2, s * (d / 2 + 0.24)], s: [0.1, h + 0.5, 0.5] })))} />
    <Boxes color="#203841" parts={[{ p: [0, h + 0.15, 0], s: [w + 0.45, 0.25, d + 0.7] }, { p: [0, 2.3, d / 2 + 0.8], s: [5, 0.14, 1.6] }]} />
    <Sign text="COMMON GROUND" width={w * 0.8} y={3.2} z={d / 2 + 0.58} />
  </group>;
}

export function UrbanBuilding({ lot, kind }: { lot: BuildingLot; kind: number }) {
  if (kind === 2 || kind === 3) return <Shop lot={lot} bistro={kind === 3} />;
  if (kind === 1) return <RoundTower lot={lot} />;
  if (kind === 5) return <FinTower lot={lot} />;
  return <CourtyardOffice lot={lot} terrace={kind === 4} />;
}
