"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type BoxPart = { p: [number, number, number]; s: [number, number, number]; r?: [number, number, number] };
export function Boxes({ parts, color, metal = 0, map }: { parts: BoxPart[]; color: string; metal?: number; map?: THREE.Texture }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    parts.forEach((part, i) => {
      dummy.position.set(...part.p); dummy.scale.set(...part.s); dummy.rotation.set(...(part.r ?? [0, 0, 0])); dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    ref.current!.computeBoundingSphere();
  }, [parts]);
  return <instancedMesh ref={ref} args={[undefined, undefined, parts.length]} castShadow receiveShadow>
    <boxGeometry /><meshStandardMaterial color={color} metalness={metal} roughness={metal ? 0.36 : 0.85} map={map} />
  </instancedMesh>;
}

function random(seed: number) {
  let value = seed >>> 0;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}

function grainTexture(bark: boolean) {
  const c = document.createElement("canvas"); c.width = 128; c.height = 256;
  const ctx = c.getContext("2d")!, rng = random(bark ? 612 : 409);
  ctx.fillStyle = bark ? "#958976" : "#e1c7a2"; ctx.fillRect(0, 0, 128, 256);
  for (let i = 0; i < (bark ? 200 : 85); i++) {
    ctx.strokeStyle = bark ? `rgba(48,40,26,${0.15 + rng() * 0.35})` : `rgba(104,69,33,${0.1 + rng() * 0.25})`;
    ctx.lineWidth = bark ? 0.5 + rng() * 2 : 0.45;
    const x = rng() * 128, y = rng() * 256;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + rng() * 5, y + 20, x - rng() * 4, y + 40, x, y + 60 + rng() * 90); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 4; return texture;
}

function leafTexture(golden: boolean) {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(25, 100, 100, 10);
  gradient.addColorStop(0, golden ? "#a56a12" : "#345a20"); gradient.addColorStop(0.55, golden ? "#ffd45c" : "#94bb5a"); gradient.addColorStop(1, golden ? "#fff2b1" : "#b5ce72");
  for (let i = 0; i < 6; i++) {
    const angle = i * 2.399, px = 64 + Math.cos(angle) * 25, py = 62 + Math.sin(angle) * 27;
    ctx.save(); ctx.translate(px, py); ctx.rotate(angle); ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.moveTo(0, -27); ctx.bezierCurveTo(23, -10, 19, 13, 0, 26); ctx.bezierCurveTo(-19, 10, -18, -10, 0, -27); ctx.fill();
    ctx.strokeStyle = golden ? "#fff5c6bb" : "#d4da9b88"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, 26); ctx.stroke();
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

export function DetailedTree({ x, z, size = 1, variant = 0, golden = false }: { x: number; z: number; size?: number; variant?: number; golden?: boolean }) {
  const leaves = useRef<THREE.InstancedMesh>(null);
  const map = useMemo(() => leafTexture(golden), [golden]);
  const bark = useMemo(() => grainTexture(true), []);
  const branchGeometry = useMemo(() => {
    const rng = random(123 + variant * 71);
    return Array.from({ length: 9 }, (_, i) => {
      const angle = i * 2.399;
      const start = new THREE.Vector3(0, 1.55 + i * 0.17, 0);
      const end = new THREE.Vector3(Math.cos(angle) * (0.65 + rng() * 0.6), 2.7 + rng() * 1.25, Math.sin(angle) * (0.6 + rng() * 0.6));
      const direction = end.clone().sub(start);
      return { position: start.add(end).multiplyScalar(0.5), rotation: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()), length: direction.length() };
    });
  }, [variant]);
  useLayoutEffect(() => {
    const rng = random(715 + variant * 31), dummy = new THREE.Object3D(), color = new THREE.Color();
    for (let i = 0; i < 520; i++) {
      const a = rng() * Math.PI * 2, y = rng() * 2 - 1, r = Math.cbrt(rng());
      const width = Math.sqrt(1 - y * y) * r;
      dummy.position.set(Math.cos(a) * width * 1.65, 3.4 + y * r * (variant % 2 ? 1.85 : 1.3), Math.sin(a) * width * 1.45);
      dummy.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
      dummy.scale.setScalar(0.45 + rng() * 0.42); dummy.updateMatrix();
      leaves.current!.setMatrixAt(i, dummy.matrix);
      color.setHSL(golden ? 0.105 + rng() * 0.035 : 0.22 + rng() * 0.055, golden ? 0.5 + rng() * 0.3 : 0.24 + rng() * 0.18, golden ? 0.66 + rng() * 0.2 : 0.43 + rng() * 0.24);
      leaves.current!.setColorAt(i, color);
    }
    leaves.current!.instanceMatrix.needsUpdate = true;
    leaves.current!.instanceColor!.needsUpdate = true;
    leaves.current!.computeBoundingSphere();
  }, [variant, golden]);
  useEffect(() => () => { map.dispose(); bark.dispose(); }, [map, bark]);
  return <group position={[x, 0, z]} scale={size}>
    <mesh position-y={1.65} castShadow><cylinderGeometry args={[0.11, 0.24, 3.3, 9, 5]} /><meshStandardMaterial color={golden ? "#b58b42" : "#8c795f"} map={bark} roughness={golden ? 0.65 : 1} /></mesh>
    {branchGeometry.map((b, i) => <mesh key={i} position={b.position} quaternion={b.rotation} castShadow><cylinderGeometry args={[0.025, 0.09, b.length, 6]} /><meshStandardMaterial color={golden ? "#957036" : "#71563e"} roughness={1} /></mesh>)}
    <instancedMesh ref={leaves} args={[undefined, undefined, 520]} castShadow receiveShadow>
      <planeGeometry /><meshStandardMaterial map={map} alphaTest={0.45} side={THREE.DoubleSide} roughness={golden ? 0.38 : 1} metalness={golden ? 0.3 : 0} emissive={golden ? "#e9a727" : "#000000"} emissiveIntensity={golden ? 0.28 : 0} />
      <meshDepthMaterial attach="customDepthMaterial" map={map} alphaTest={0.45} side={THREE.DoubleSide} depthPacking={THREE.RGBADepthPacking} />
    </instancedMesh>
    {variant % 2 === 0 && <Boxes color="#564633" parts={Array.from({ length: 3 }, (_, i) => ({ p: [Math.cos(i * 2.1) * 0.32, 0.06, Math.sin(i * 2.1) * 0.32], s: [0.45, 0.09, 0.13], r: [0, -i * 2.1, 0] }))} />}
  </group>;
}

export function Bench({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  const grain = useMemo(() => grainTexture(false), []);
  useEffect(() => () => grain.dispose(), [grain]);
  const wood: BoxPart[] = [
    ...Array.from({ length: 5 }, (_, i): BoxPart => ({ p: [0, 0.62, -0.34 + i * 0.17], s: [2.7, 0.09, 0.135] })),
    ...Array.from({ length: 4 }, (_, i): BoxPart => ({ p: [0, 0.87 + i * 0.16, -0.44 - i * 0.025], s: [2.7, 0.115, 0.065], r: [-0.13, 0, 0] })),
  ];
  const frame: BoxPart[] = [-1, 1].flatMap(s => [
    { p: [s * 1, 0.31, 0] as [number, number, number], s: [0.09, 0.62, 0.68] as [number, number, number] },
    { p: [s * 1, 0.8, -0.44] as [number, number, number], s: [0.09, 1.3, 0.09] as [number, number, number] },
    { p: [s * 1.15, 0.88, 0] as [number, number, number], s: [0.075, 0.07, 0.75] as [number, number, number] },
    { p: [s * 1.15, 0.72, 0.3] as [number, number, number], s: [0.07, 0.35, 0.07] as [number, number, number] },
  ]);
  return <group position={[x, 0.1, z]} rotation-y={rotation}><Boxes color="#ab8258" parts={wood} map={grain} /><Boxes color="#314348" metal={0.7} parts={frame} /></group>;
}

export function StreetLamp({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  return <group position={[x, 0, z]} rotation-y={rotation}>
    <mesh position-y={2.3} castShadow><cylinderGeometry args={[0.045, 0.09, 4.6, 10]} /><meshStandardMaterial color="#36484e" metalness={0.7} roughness={0.4} /></mesh>
    <Boxes color="#36484e" metal={0.7} parts={[
      { p: [0.45, 4.5, 0], s: [1, 0.08, 0.1], r: [0, 0, 0.12] },
      { p: [0.88, 4.57, 0], s: [0.64, 0.1, 0.3] },
      { p: [0, 0.13, 0], s: [0.24, 0.25, 0.24] },
    ]} />
    <mesh position={[0.9, 4.51, 0]} rotation-x={Math.PI / 2}><planeGeometry args={[0.52, 0.22]} /><meshStandardMaterial color="#fff9d9" emissive="#fff2c9" emissiveIntensity={0.7} /></mesh>
    <Boxes color="#69b7a7" parts={[{ p: [0.2, 3.2, 0], s: [0.48, 0.85, 0.035] }]} />
  </group>;
}

export function CafeTable({ x, z }: { x: number; z: number }) {
  return <group position={[x, 0.13, z]}>
    <mesh position-y={0.85} castShadow><cylinderGeometry args={[0.58, 0.58, 0.08, 24]} /><meshStandardMaterial color="#a77d53" roughness={0.65} /></mesh>
    <mesh position-y={0.43} castShadow><cylinderGeometry args={[0.055, 0.08, 0.8, 8]} /><meshStandardMaterial color="#37474a" metalness={0.6} /></mesh>
    <Boxes color="#354648" metal={0.6} parts={[{ p: [0, 0.07, 0], s: [0.75, 0.07, 0.08] }, { p: [0, 0.07, 0], s: [0.08, 0.07, 0.75] }]} />
    {[-1, 1].map(s => <group key={s} position={[s * 1, 0, 0]} rotation-y={-s * Math.PI / 2}>
      <Boxes color="#c3b48e" parts={[{ p: [0, 0.48, 0], s: [0.54, 0.07, 0.52] }, { p: [0, 0.84, -0.24], s: [0.54, 0.48, 0.055] }]} />
      <Boxes color="#34464a" metal={0.6} parts={[-1, 1].flatMap(a => [-1, 1].map(b => ({ p: [a * 0.22, 0.24, b * 0.2] as [number, number, number], s: [0.045, 0.48, 0.045] as [number, number, number] })))} />
    </group>)}
    <mesh position={[0.15, 0.97, 0]}><cylinderGeometry args={[0.1, 0.085, 0.18, 12]} /><meshStandardMaterial color="#efece0" /></mesh>
    <mesh position={[-0.2, 0.92, 0.13]}><cylinderGeometry args={[0.15, 0.15, 0.02, 16]} /><meshStandardMaterial color="#ded9c9" /></mesh>
  </group>;
}

export function StreetFurniture() {
  return <group>
    {[-1, 1].flatMap(s => [-13, -4, 7].map(z => <Bench key={`${s}-${z}`} x={s * 10.9} z={z} rotation={-s * Math.PI / 2} />))}
    {[-1, 1].flatMap(s => [-17, -6, 5, 17].map(z => <StreetLamp key={`${s}-${z}`} x={s * 16} z={z} rotation={s > 0 ? Math.PI : 0} />))}
    {[-1, 1].map(s => <group key={s} position={[s * 10.8, 0.1, 11]}>
      <mesh position-y={0.5}><cylinderGeometry args={[0.3, 0.28, 1, 16]} /><meshStandardMaterial color="#384b4f" metalness={0.55} roughness={0.55} /></mesh>
      <mesh position-y={1.01} rotation-x={-Math.PI / 2}><torusGeometry args={[0.25, 0.055, 8, 20]} /><meshStandardMaterial color="#83928b" metalness={0.5} /></mesh>
    </group>)}
    {[-1, 1].flatMap(s => [0, 1, 2].map(i => <mesh key={`${s}-${i}`} position={[s * (3.1 + i * 1.2), 0.57, 18.8]} castShadow><cylinderGeometry args={[0.1, 0.12, 0.94, 12]} /><meshStandardMaterial color="#4d5c5b" metalness={0.65} roughness={0.35} /></mesh>))}
  </group>;
}
