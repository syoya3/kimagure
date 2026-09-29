"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MeshyAsset } from "./MeshyAsset";
import { DetailedTree, StreetFurniture } from "./CityDetails";
import { GoalTree } from "./GoalTree";
import { useMobileQuality } from "./RenderQuality";
import { UrbanBuilding } from "./UrbanBuildings";
import { RealisticCar, CityReflections } from "./RealisticCar";

export const CITY_BUILDINGS = [
  { x: -22, z: -15, w: 9, d: 10, h: 19 },
  { x: 22, z: -16, w: 10, d: 11, h: 24 },
  { x: -23, z: 4, w: 10, d: 10, h: 12 },
  { x: 24, z: 5, w: 11, d: 10, h: 14 },
  { x: -15, z: -34, w: 9, d: 9, h: 25 },
  { x: 16, z: -35, w: 10, d: 10, h: 20 },
  { x: 0, z: -29, w: 12, d: 11, h: 27 },
];

type BoxProps = { position: [number, number, number]; size: [number, number, number]; color: string; metal?: number };
function Block({ position, size, color, metal = 0 }: BoxProps) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={metal ? 0.3 : 0.8} metalness={metal} /></mesh>;
}

function facadeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#203f50"; ctx.fillRect(0, 0, 256, 512);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) {
    const value = (x * 17 + y * 13) % 11;
    ctx.fillStyle = ["#567c8c", "#7c9ea7", "#315569", "#42677a", "#abc5c7"][value % 5];
    ctx.fillRect(x * 32 + 2, y * 32 + 2, 28, 26);
    if (value === 0) { ctx.fillStyle = "#d1d6bd"; ctx.fillRect(x * 32 + 4, y * 32 + 19, 24, 7); }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

function Office({ x, z, w, d, h, index = 0 }: typeof CITY_BUILDINGS[number] & { index?: number }) {
  const map = useMemo(facadeTexture, []);
  useEffect(() => () => map.dispose(), [map]);
  return <group position={[x, 0, z]}>
    <Block position={[0, 0.18, 0]} size={[w + 2, 0.36, d + 2]} color="#c9d2cf" />
    <Block position={[0, 1.2, 0]} size={[w + 0.5, 2.2, d + 0.5]} color="#e1e3d9" />
    <mesh position={[0, h / 2 + 1, 0]} castShadow receiveShadow><boxGeometry args={[w, h, d]} /><meshStandardMaterial map={map} color={index % 2 ? "#bed6d6" : "#ecf4ef"} metalness={0.48} roughness={0.3} /></mesh>
    {Array.from({ length: Math.floor(h / 3) + 1 }, (_, i) => <Block key={i} position={[0, 1 + i * 3, 0]} size={[w + 0.15, 0.12, d + 0.15]} color="#a6b6b8" metal={0.4} />)}
    {[-1, 1].map(s => <Block key={s} position={[s * w / 2, h / 2 + 1, d / 2]} size={[0.24, h, 0.25]} color="#d3ddd8" />)}
    <Block position={[0, h + 1.12, 0]} size={[w + 0.45, 0.3, d + 0.45]} color="#e2e8df" />
    <Block position={[0, h + 1.35, 0]} size={[w - 1, 0.2, d - 1]} color="#668f6b" />
    <Block position={[-w * 0.22, h + 1.65, 0]} size={[w * 0.35, 0.45, d * 0.6]} color="#253e54" metal={0.5} />
    <Block position={[w * 0.26, h + 1.6, -d * 0.2]} size={[1.5, 0.65, 2]} color="#97a7aa" />
    <Block position={[0, 2.3, d / 2 + 0.65]} size={[w * 0.55, 0.18, 1.8]} color="#233d48" metal={0.5} />
    <Block position={[0, 1.15, d / 2 + 0.05]} size={[2.6, 2.1, 0.12]} color="#2e6878" metal={0.5} />
  </group>;
}

export function CityTree({ x, z, size = 1 }: { x: number; z: number; size?: number }) {
  return <DetailedTree x={x} z={z} size={size} variant={Math.abs(Math.round(x * 3 + z)) % 4} />;
}

function Road({ x, z, length, vertical = false }: { x: number; z: number; length: number; vertical?: boolean }) {
  return <group position={[x, 0, z]} rotation-y={vertical ? Math.PI / 2 : 0}>
    <Block position={[0, -0.02, 0]} size={[length, 0.12, 8]} color="#46545a" />
    {[-1, 1].map(s => <group key={s}>
      <Block position={[0, 0.1, s * 4.55]} size={[length, 0.22, 1.1]} color="#c6cfcd" />
      <Block position={[0, 0.05, s * 3.3]} size={[length, 0.02, 0.09]} color="#cad1cd" />
      <Block position={[0, 0.05, s * 2.8]} size={[length, 0.02, 0.65]} color="#477f7c" />
    </group>)}
    {Array.from({ length: Math.floor(length / 4) }, (_, i) => <Block key={i} position={[-length / 2 + 2 + i * 4, 0.06, 0]} size={[1.8, 0.02, 0.12]} color="#d4d5bf" />)}
  </group>;
}

function Crosswalk({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  return <group position={[x, 0.08, z]} rotation-y={rotation}>{Array.from({ length: 9 }, (_, i) => <Block key={i} position={[-3.2 + i * 0.8, 0, 0]} size={[0.45, 0.015, 2.4]} color="#e3e5d9" />)}</group>;
}

function Traffic({ offset, color, reverse = false }: { offset: number; color: string; reverse?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.x = ((clock.elapsedTime * 3 + offset) % 130 - 65) * (reverse ? -1 : 1);
  });
  return <group ref={ref} position={[offset, 0, reverse ? 23.6 : 26.4]} rotation-y={reverse ? Math.PI : 0}>
    <RealisticCar color={color} variant={offset % 2} speed={3} />
  </group>;
}

function Plaza() {
  return <group>
    <Block position={[0, 0.02, -1]} size={[32, 0.12, 42]} color="#cdd6d1" />
    {Array.from({ length: 15 }, (_, i) => <Block key={i} position={[-14 + i * 2, 0.085, -1]} size={[0.025, 0.01, 42]} color="#b4c1bd" />)}
    {Array.from({ length: 21 }, (_, i) => <Block key={i} position={[0, 0.085, -21 + i * 2]} size={[32, 0.01, 0.025]} color="#b4c1bd" />)}
    <Block position={[0, 0.1, 9]} size={[3, 0.03, 22]} color="#e8e9df" />
    {[-1, 1].flatMap(s => [-13, -4, 7].map(z => <group key={`${s}-${z}`}>
      <Block position={[s * 13, 0.28, z]} size={[3, 0.5, 5.5]} color="#e8e9de" />
      <Block position={[s * 13, 0.54, z]} size={[2.7, 0.04, 5.2]} color="#769966" />
      <CityTree x={s * 13} z={z} size={0.9} />

    </group>))}
    <GoalTree />
    <StreetFurniture />
  </group>;
}

export default function CityEnvironment() {
  const mobile = useMobileQuality();
  return <group>
    <CityReflections />
    <hemisphereLight args={["#f1f5ff", "#b0b5a8", 1.9]} />
    <directionalLight position={[-35, 60, 25]} intensity={2.2} color="#fff2d9" castShadow shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]} shadow-camera-left={-65} shadow-camera-right={65} shadow-camera-top={65} shadow-camera-bottom={-65} shadow-camera-far={180} shadow-normalBias={0.06} />
    <Block position={[0, -0.3, -8]} size={[180, 0.4, 160]} color="#8da882" />
    <Road x={0} z={25} length={150} />
    <Road x={-35} z={-8} length={110} vertical />
    <Road x={35} z={-8} length={110} vertical />
    <Road x={0} z={-46} length={150} />
    <Crosswalk x={0} z={25} />
    <Crosswalk x={-35} z={18} />
    <Crosswalk x={35} z={18} />
    <Plaza />
    {CITY_BUILDINGS.map((b, i) => i === 6 ? <group key={i} position={[b.x, 0.2, b.z]}>
      <MeshyAsset url="/models/tech-campus/office.glb" height={27} maxWidth={12} maxDepth={11} fallback={<Office {...b} x={0} z={0} />} />
    </group> : <UrbanBuilding key={i} lot={b} kind={i} />)}
    {[-1, 1].flatMap(s => [0, 1, 2, 3].map(i => <UrbanBuilding key={`${s}-${i}`} lot={{ x: s * (46 + (i % 2) * 15), z: -30 + Math.floor(i / 2) * 23, w: 9, d: 11, h: 14 + ((i * 7) % 17) }} kind={[0, 5, 4, 1][(i + (s > 0 ? 1 : 0)) % 4]} />))}
    {Array.from({ length: 12 }, (_, i) => <CityTree key={i} x={-29 + i * 5.3} z={19} size={0.7 + (i % 3) * 0.1} />)}
    {Array.from({ length: 8 }, (_, i) => <CityTree key={`rear-${i}`} x={-28 + i * 8} z={-40} size={1} />)}
    <Traffic offset={7} color="#e7e8df" /><Traffic offset={42} color="#3f7d88" />
    <Traffic offset={80} color="#e0bf72" reverse /><Traffic offset={113} color="#e6e9e5" reverse />
  </group>;
}
