"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { useMobileQuality } from "./RenderQuality";

function Panel({ points, color = "#16323c", glass = false }: { points: [number, number, number][]; color?: string; glass?: boolean }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
    g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); return g;
  }, [points]);
  return <mesh geometry={geometry} castShadow><meshPhysicalMaterial color={color} metalness={glass ? .45 : .6} roughness={glass ? .13 : .3} clearcoat={1} side={THREE.DoubleSide} /></mesh>;
}

function Wheel({ x, z, speed }: { x: number; z: number; speed: number }) {
  const mobile = useMobileQuality();
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z -= speed * Math.min(dt, .05) / .36; });
  return <group position={[x, .41, z]}>
    <group ref={ref}>
      <mesh rotation-x={Math.PI / 2} castShadow><cylinderGeometry args={[.36, .36, .24, 32]} /><meshStandardMaterial color="#171b20" roughness={.94} /></mesh>
      {(mobile ? [Math.sign(z)] : [-1, 1]).map(s => <group key={s} position-z={s * .126}>
        <mesh><torusGeometry args={[.267, .025, 8, 32]} /><meshStandardMaterial color="#899499" metalness={.88} roughness={.24} /></mesh>
        <mesh rotation-x={Math.PI / 2}><cylinderGeometry args={[.23, .23, .012, 24]} /><meshStandardMaterial color="#303b41" metalness={.75} roughness={.35} /></mesh>
        {!mobile && Array.from({ length: 5 }, (_, i) => <group key={i} rotation-z={i * Math.PI * 2 / 5}>
          <mesh position-y={.13} rotation-z={.16}><boxGeometry args={[.053, .26, .024]} /><meshStandardMaterial color="#c5cdd0" metalness={.85} roughness={.2} /></mesh>
        </group>)}
        <mesh><sphereGeometry args={[.077, 12, 8]} /><meshStandardMaterial color="#75878f" metalness={.85} roughness={.25} /></mesh>
      </group>)}
    </group>
  </group>;
}

export function RealisticCar({ color, variant = 0, speed = 3 }: { color: string; variant?: number; speed?: number }) {
  const mobile = useMobileQuality();
  const group = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    if (mobile) group.current?.traverse(object => { if (object instanceof THREE.Mesh) object.castShadow = false; });
  }, [mobile]);
  const suv = variant % 2 === 1;
  const roof = suv ? 1.68 : 1.43;
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.15, .38); shape.lineTo(-1.84, .38);
    shape.bezierCurveTo(-1.84, 1.01, -.96, 1.01, -.96, .38);
    shape.lineTo(.94, .38); shape.bezierCurveTo(.94, 1.01, 1.82, 1.01, 1.82, .38);
    shape.lineTo(2.2, .38); shape.quadraticCurveTo(2.32, .52, 2.24, .79);
    shape.quadraticCurveTo(2.12, .9, 1.02, 1.00); shape.lineTo(-1.55, 1.01);
    shape.lineTo(-2.2, .88); shape.quadraticCurveTo(-2.3, .6, -2.15, .38);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 1.62, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .075, bevelThickness: .075, curveSegments: 18 });
    g.translate(0, 0, -.81); g.computeVertexNormals(); return g;
  }, []);
  const rear = suv ? -1.58 : -1.4, rearRoof = suv ? -1.2 : -.8;
  return <group ref={group}>
    {mobile && <mesh position-y={0.09} rotation-x={-Math.PI / 2} scale={[2.3, 1, 1]}>
      <circleGeometry args={[1, 24]} /><meshBasicMaterial color="#243b3d" transparent opacity={0.15} depthWrite={false} />
    </mesh>}
    <mesh geometry={bodyGeometry} castShadow receiveShadow><meshPhysicalMaterial color={color} metalness={.42} roughness={.26} clearcoat={1} clearcoatRoughness={.15} /></mesh>
    <RoundedBox args={[3.96, .13, 1.58]} radius={.04} position={[0, .35, 0]}><meshStandardMaterial color="#242b31" roughness={.65} /></RoundedBox>
    {/* Windshield, rear glass and individually framed side windows. */}
    <Panel glass points={[[1.02, 1.03, -.77], [1.02, 1.03, .77], [.35, roof, .65], [.35, roof, -.65]]} />
    <Panel glass points={[[rearRoof, roof, -.65], [rearRoof, roof, .65], [rear, 1.04, .77], [rear, 1.04, -.77]]} />
    <RoundedBox args={[.35 - rearRoof + .12, .065, 1.37]} radius={.03} position={[(.35 + rearRoof) / 2, roof + .02, 0]}><meshPhysicalMaterial color={color} metalness={.65} roughness={.25} clearcoat={1} /></RoundedBox>
    {[-1, 1].map(s => <group key={s}>
      <Panel glass points={[[-.34, 1.04, s * .81], [.94, 1.04, s * .79], [.31, roof - .045, s * .67], [-.34, roof - .045, s * .67]]} />
      <Panel glass points={[[rear + .08, 1.04, s * .79], [-.43, 1.04, s * .81], [-.43, roof - .045, s * .67], [rearRoof + .05, roof - .045, s * .67]]} />
      <Panel color={color} points={[[rear, 1.02, s * .81], [rear + .15, 1.04, s * .81], [rearRoof + .1, roof, s * .68], [rearRoof - .035, roof, s * .68]]} />
      <Panel color={color} points={[[.94, 1.02, s * .82], [1.07, 1.02, s * .79], [.39, roof + .02, s * .67], [.28, roof + .02, s * .68]]} />
      <Panel color="#17252c" points={[[-.43, 1.03, s * .817], [-.34, 1.03, s * .817], [-.34, roof, s * .68], [-.43, roof, s * .68]]} />
      <mesh position={[0, 1.008, s * .855]}><boxGeometry args={[2.93, .025, .025]} /><meshStandardMaterial color="#bbc2c1" metalness={.85} roughness={.23} /></mesh>
      {[-.75, .5].map(x => <RoundedBox key={x} args={[.21, .045, .035]} radius={.014} position={[x, .9, s * .9]}><meshStandardMaterial color="#c7cfd1" metalness={.8} roughness={.3} /></RoundedBox>)}
      <RoundedBox args={[.28, .16, .18]} radius={.06} position={[.72, 1.06, s * 1.00]}><meshPhysicalMaterial color={color} metalness={.55} roughness={.25} clearcoat={1}/></RoundedBox>
      <mesh position={[.69, 1.066, s * 1.102]}><boxGeometry args={[.18, .08, .009]} /><meshStandardMaterial color="#9cb7c5" metalness={1} roughness={.1} /></mesh>
      <RoundedBox args={[.07, .115, .5]} radius={.035} position={[2.35, .78, s * .53]}><meshStandardMaterial color="#edf7ff" emissive="#e0f2ff" emissiveIntensity={1.2} /></RoundedBox>
      <RoundedBox args={[.055, .12, .44]} radius={.025} position={[-2.30, .75, s * .55]}><meshStandardMaterial color="#bd1534" emissive="#d32235" emissiveIntensity={.7} /></RoundedBox>
      <Wheel x={-1.4} z={s * .88} speed={speed} /><Wheel x={1.38} z={s * .88} speed={speed} />
    </group>)}
    <RoundedBox args={[.05, .19, .85]} radius={.035} position={[2.38, .54, 0]}><meshStandardMaterial color="#15242c" roughness={.4}/></RoundedBox>
    {[-.23, -.115, 0, .115, .23].map(z => <mesh key={z} position={[2.41, .55, z]}><boxGeometry args={[.008, .14, .017]} /><meshStandardMaterial color="#65747b" metalness={.8} roughness={.35} /></mesh>)}
    {[-1, 1].map(s => <mesh key={s} position={[s * 2.39, .59, 0]}><boxGeometry args={[.013, .11, .35]} /><meshStandardMaterial color="#eef0e4" roughness={.55} /></mesh>)}
  </group>;
}

// A small, locally rendered reflection map supplies sky and broad highlights
// without downloading an HDR panorama or rendering the city every frame.
export function CityReflections() {
  return <Environment resolution={128} frames={1} environmentIntensity={.65}>
    <mesh><sphereGeometry args={[40, 16, 12]} /><meshBasicMaterial color="#bbcdd8" side={THREE.BackSide} /></mesh>
    <Lightformer intensity={2.5} position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[18, 14, 1]} />
    <Lightformer intensity={1.5} position={[-10, 5, 0]} rotation-y={Math.PI / 2} scale={[5, 10, 1]} />
    <Lightformer intensity={1} position={[5, 3, 10]} rotation-y={Math.PI} scale={[4, 8, 1]} />
  </Environment>;
}
