"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { NPCS, type Npc } from "./data";
import { useGame } from "./store";
import { useCityZoom } from "./useCityZoom";
import { keepPlayerInFrame } from "./cameraFollow";
import { input } from "./input";
import CityEnvironment, { CITY_BUILDINGS } from "./CityEnvironment";
import { MeshyAsset } from "./MeshyAsset";
import { AnimatedCitizen, type Locomotion } from "./AnimatedCitizen";

const CYAN = "#77e0d0";
const CAMERA_YAW = Math.PI / 6;

function CitizenFallback({ color = "#263f52" }: { color?: string }) {
  return <group>
    <mesh position-y={2.06} castShadow><sphereGeometry args={[0.22, 12, 12]} /><meshStandardMaterial color="#d7ad8c" /></mesh>
    <mesh position-y={2.19} scale={[1, 0.65, 1]} castShadow><sphereGeometry args={[0.225, 12, 8]} /><meshStandardMaterial color="#273035" /></mesh>
    <mesh position-y={1.5} castShadow><capsuleGeometry args={[0.29, 0.52, 4, 8]} /><meshStandardMaterial color={color} /></mesh>
    {[-1, 1].map(s => <group key={s}>
      <mesh position={[s * 0.14, 0.58, 0]} castShadow><capsuleGeometry args={[0.1, 0.75, 4, 8]} /><meshStandardMaterial color="#28343e" /></mesh>
      <mesh position={[s * 0.39, 1.4, 0]} rotation-z={s * 0.1} castShadow><capsuleGeometry args={[0.085, 0.65, 4, 8]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[s * 0.14, 0.12, 0.06]} castShadow><boxGeometry args={[0.2, 0.16, 0.34]} /><meshStandardMaterial color="#e8e8df" /></mesh>
    </group>)}
  </group>;
}

const CITIZEN_HEIGHTS: Record<string, number> = { nagi: 2.3, miki: 2.45, sora: 2.2, tsudoi: 2.5, taiju: 2.6 };
// Horizontal centres of the upper head band in each normalized Meshy asset.
const HEAD_OFFSETS: Record<string, [number, number]> = { nagi: [.008, .005], miki: [-.008, .049], sora: [-.008, -.055], tsudoi: [-.073, .09], taiju: [-.045, .058] };
function Citizen({ npc }: { npc: Npc }) {
  return <MeshyAsset url={`/models/tech-campus/${npc.id}.glb`} height={CITIZEN_HEIGHTS[npc.id]} natural fallback={<CitizenFallback color={npc.top} />} />;
}

function NpcView({ npc }: { npc: Npc }) {
  const overview = useGame(s => s.overview);
  const inConversation = useGame(s => !!s.dialogue);
  const talked = useGame(s => s.talked.includes(npc.id));
  const near = useGame(s => s.nearId === npc.id);
  const started = useGame(s => s.started);
  return <group position={[npc.pos[0], 0.12, npc.pos[1]]}>
    <group rotation-y={npc.ry}><Citizen npc={npc} /></group>
    <mesh visible={!inConversation} rotation-x={-Math.PI / 2} position-y={0.04}>
      <ringGeometry args={[0.67, near ? 0.91 : 0.79, 40]} />
      <meshStandardMaterial color={talked ? "#82a6a0" : CYAN} emissive={CYAN} emissiveIntensity={near ? 0.65 : 0.15} />
    </mesh>
    {started && !inConversation && !overview && <Html position={[0, 3.3, 0]} center zIndexRange={[9, 0]}>
      <button className={`citizen-label ${near ? "is-near" : ""} ${talked ? "is-collected" : ""}`} onClick={() => {
        if (near && !useGame.getState().dialogue) useGame.getState().openDialogue(npc.id);
      }} aria-label={`${npc.name}${near ? "に話しかける" : "に近づくと会話できます"}`}>
        <span>{talked ? "✓ " : ""}{npc.role}</span><strong>{npc.name}</strong>
      </button>
    </Html>}
  </group>;
}

function resolvePosition(x: number, z: number) {
  let nx = THREE.MathUtils.clamp(x, -30, 30);
  let nz = THREE.MathUtils.clamp(z, -39, 20);
  for (const b of CITY_BUILDINGS) {
    const hw = b.w / 2 + 0.8, hd = b.d / 2 + 0.8;
    const dx = nx - b.x, dz = nz - b.z;
    if (Math.abs(dx) < hw && Math.abs(dz) < hd) {
      if (hw - Math.abs(dx) < hd - Math.abs(dz)) nx = b.x + (dx < 0 ? -hw : hw);
      else nz = b.z + (dz < 0 ? -hd : hd);
    }
  }
  const circles = [{ x: 0, z: -14, r: 3.65 }, ...NPCS.map(n => ({ x: n.pos[0], z: n.pos[1], r: 1.15 })),
    ...[-1, 1].flatMap(s => [2, 6].map(z => ({ x: s < 0 ? -15.7 : 16.7, z, r: 1.45 })))];
  for (const c of circles) {
    const dx = nx - c.x, dz = nz - c.z, d = Math.hypot(dx, dz);
    if (d < c.r) { nx = c.x + (d > 0.001 ? dx / d : 1) * c.r; nz = c.z + (d > 0.001 ? dz / d : 0) * c.r; }
  }
  // Raised planting beds along both edges of the pedestrian plaza.
  for (const sx of [-13, 13]) for (const sz of [-13, -4, 7]) {
    if (Math.abs(nx - sx) < 2 && Math.abs(nz - sz) < 3.25) {
      const dx = nx - sx, dz = nz - sz;
      if (2 - Math.abs(dx) < 3.25 - Math.abs(dz)) nx = sx + (dx < 0 ? -2 : 2);
      else nz = sz + (dz < 0 ? -3.25 : 3.25);
    }
  }
  return [nx, nz];
}

function Player() {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const facing = useRef(Math.PI);
  const { zoom, pan, dragging } = useCityZoom();
  const overview = useGame(s => s.overview);
  const velocity = useRef(0);
  const dialogue = useGame(s => s.dialogue);
  const motion = useRef<Locomotion>({ speed: 0 });
  const target = useMemo(() => new THREE.Vector3(), []);
  const cameraPosition = useMemo(() => new THREE.Vector3(), []);
  const cameraOffset = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useRef(new THREE.Vector3(0, 0, -6));
  const started = useGame(s => s.started);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    const game = useGame.getState();
    const magnitude = Math.min(1, Math.hypot(input.x, input.z));
    const moving = game.started && !game.dialogue && magnitude > 0.05;
    let alignment = 1;
    if (moving) {
      const dx = Math.cos(CAMERA_YAW) * input.x + Math.sin(CAMERA_YAW) * input.z;
      const dz = -Math.sin(CAMERA_YAW) * input.x + Math.cos(CAMERA_YAW) * input.z;
      const angle = Math.atan2(dx, dz);
      const difference = Math.atan2(Math.sin(angle - facing.current), Math.cos(angle - facing.current));
      facing.current += THREE.MathUtils.clamp(difference, -9 * dt, 9 * dt);
      alignment = Math.max(0, Math.cos(difference));
    }
    const desiredSpeed = moving ? magnitude * 5.2 * alignment : 0;
    velocity.current = game.dialogue || !game.started ? 0 : THREE.MathUtils.damp(velocity.current, desiredSpeed, moving ? 10 : 18, dt);
    motion.current.speed = 0;
    if (velocity.current > .015) {
      // Travel in the facing direction: a reversal slows and turns before
      // accelerating, instead of sliding backwards while the body catches up.
      const [x, z] = resolvePosition(g.position.x + Math.sin(facing.current) * velocity.current * dt,
        g.position.z + Math.cos(facing.current) * velocity.current * dt);
      motion.current.speed = dt > 0 ? Math.hypot(x - g.position.x, z - g.position.z) / dt : 0;
      g.position.x = x; g.position.z = z;
    }
    if (body.current) body.current.rotation.y = facing.current;
    let near: string | null = null, best = 3.3;
    if (game.started) for (const n of NPCS) {
      const d = Math.hypot(g.position.x - n.pos[0], g.position.z - n.pos[1]);
      if (d < best) { near = n.id; best = d; }
    }
    game.setNear(near);
    const portrait = state.size.width < 700;
    if (game.overview !== (zoom.current > 2.3)) useGame.setState({ overview: zoom.current > 2.3 });
    const speaker = game.dialogue ? NPCS.find(n => n.id === game.dialogue!.npcId) : undefined;
    if (speaker) {
      const height = CITIZEN_HEIGHTS[speaker.id];
      const frontX = Math.sin(speaker.ry), frontZ = Math.cos(speaker.ry);
      // Chest-up view, with the eyes above centre and room for the dialogue below.
      const distance = portrait ? 1.75 : 1.6;
      const [headX, headZ] = HEAD_OFFSETS[speaker.id];
      target.set(speaker.pos[0] + Math.cos(speaker.ry) * headX + frontX * headZ, 0.12 + height * 0.81,
        speaker.pos[1] - frontX * headX + frontZ * headZ);
      cameraPosition.set(target.x + frontX * distance, 0.12 + height * 0.90, target.z + frontZ * distance);
    } else if (game.started) {
      // Follow the full world position at every zoom. Manual inspection pans
      // are released when movement resumes, rather than leaving the player behind.
      if (moving && !dragging.current) pan.current.multiplyScalar(Math.exp(-8 * dt));
      target.set(g.position.x + pan.current.x, 1.1, g.position.z + pan.current.z);
      cameraOffset.set(portrait ? 16 : 12.5, portrait ? 27 : 21, portrait ? 28 : 21.65);
      cameraOffset.multiplyScalar(zoom.current);
      cameraPosition.copy(target).add(cameraOffset);
    } else {
      target.set(portrait ? 0 : -5, 1, -8);
      cameraPosition.set(portrait ? 58 : 49, portrait ? 67 : 56, portrait ? 79 : 66);
    }
    const blend = 1 - Math.exp(-(speaker ? 5 : 8) * dt);
    state.camera.position.lerp(cameraPosition, blend);
    lookAt.current.lerp(target, blend);
    state.camera.lookAt(lookAt.current);
    if (game.started && !speaker && moving) keepPlayerInFrame(state.camera, lookAt.current, g.position);

    if (process.env.NODE_ENV === "development") {
      state.gl.domElement.dataset.cameraMode = speaker ? `conversation:${speaker.id}` : "explore";
      state.gl.domElement.dataset.cityZoom = zoom.current.toFixed(3);
      state.gl.domElement.dataset.cameraPan = JSON.stringify(pan.current.toArray());
      const screen = g.position.clone().add(new THREE.Vector3(0, 1.2, 0)).project(state.camera);
      state.gl.domElement.dataset.playerScreen = JSON.stringify(screen.toArray());
    }
  });
  return <group ref={group} position={[0, 0.12, 14]} visible={!dialogue}>
    <group ref={body}><AnimatedCitizen motion={motion} /></group>
    <mesh rotation-x={-Math.PI / 2} position-y={0.03}><ringGeometry args={[0.57, 0.72, 32]} /><meshBasicMaterial color="#f1d67d" /></mesh>
    {started && !dialogue && !overview && <Html position={[0, 3.15, 0]} center zIndexRange={[9, 0]}><div className="guest-label">YOU</div></Html>}
  </group>;
}

export default function Scene() {
  const dialogue = useGame(s => s.dialogue);
  return <>
    <color attach="background" args={["#d4e3e5"]} />
    <fog attach="fog" args={["#d4e3e5", 160, 340]} />
    <CityEnvironment />
    {!dialogue && <Html position={[0, 4.8, -23.3]} center distanceFactor={35} zIndexRange={[8, 0]}><div className="building-sign">KIMAGURE<span>TECHNOLOGY & COMMUNITY</span></div></Html>}
    {NPCS.map(n => <NpcView key={n.id} npc={n} />)}
    <Player />
  </>;
}
