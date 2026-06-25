"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import * as THREE from "three";
import { NPCS, type Npc } from "./data";
import { useGame } from "./store";
import { input } from "./input";

const ACCENT = "#ddc527";

// ---- 当たり判定（XZ平面の円） ----
type Collider = { x: number; z: number; r: number };
const TREE_COLLIDER: Collider = { x: 0, z: -14, r: 2.6 };

// 街の建物（オフィス＋お店・住宅をミックス）
type Bld = { pos: [number, number]; size: [number, number, number]; wall: string; roof: string; roofType: "flat" | "pitch"; sign?: string };
const BUILDINGS: Bld[] = [
  { pos: [0, -26], size: [17, 18, 9], wall: "#dfe5ea", roof: "#2f6cc0", roofType: "flat", sign: "KIMAGURE" }, // 本社オフィス
  { pos: [-20, -8], size: [8, 9, 9], wall: "#e9c98a", roof: "#b4523a", roofType: "pitch" },
  { pos: [20, -9], size: [8, 11, 9], wall: "#cfd6dd", roof: "#3a4a5a", roofType: "flat" },
  { pos: [-22, 9], size: [8, 7, 8], wall: "#e6ddc6", roof: "#c06a3a", roofType: "pitch" },
  { pos: [22, 10], size: [8, 8, 8], wall: "#d6e0d2", roof: "#6a8a55", roofType: "pitch" },
  { pos: [-14, -22], size: [7, 6, 7], wall: "#f0e2c4", roof: "#a85a44", roofType: "pitch" },
  { pos: [14, -22], size: [7, 9, 7], wall: "#dde3e8", roof: "#4a5a6a", roofType: "flat" },
];

const COLLIDERS: Collider[] = [
  TREE_COLLIDER,
  ...BUILDINGS.map((b) => ({ x: b.pos[0], z: b.pos[1], r: Math.max(b.size[0], b.size[2]) * 0.55 })),
  ...NPCS.map((n) => ({ x: n.pos[0], z: n.pos[1], r: 0.9 })),
];

// ============ 地面テクスチャ（土・コンクリート・芝・アスファルト） ============
function noiseTexture(base: string, specks: string[], density: number, repeat: number, lines?: boolean) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const x = c.getContext("2d")!;
  x.fillStyle = base;
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < density; i++) {
    x.fillStyle = specks[i % specks.length];
    const s = 1 + Math.random() * 3;
    x.globalAlpha = 0.5 + Math.random() * 0.5;
    x.fillRect(Math.random() * 256, Math.random() * 256, s, s);
  }
  x.globalAlpha = 1;
  if (lines) {
    x.strokeStyle = "rgba(0,0,0,0.10)";
    x.lineWidth = 2;
    for (let i = 0; i <= 256; i += 64) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i, 256);
      x.moveTo(0, i);
      x.lineTo(256, i);
      x.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Ground() {
  const grass = useMemo(() => noiseTexture("#7fb358", ["#6fa348", "#8fc468", "#5e923c"], 1400, 16), []);
  const concrete = useMemo(() => noiseTexture("#c4c2bc", ["#b4b2ac", "#d0cec8", "#a8a6a0"], 700, 6, true), []);
  const dirt = useMemo(() => noiseTexture("#8a6743", ["#7a5836", "#9c7a52", "#6e4d2e"], 900, 4), []);
  const asphalt = useMemo(() => noiseTexture("#5b5f65", ["#4f535a", "#686c72", "#44474d"], 800, 8), []);

  return (
    <group>
      {/* 芝の大地 */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.04} receiveShadow>
        <circleGeometry args={[64, 48]} />
        <meshStandardMaterial map={grass} roughness={1} />
      </mesh>
      {/* コンクリートの広場 */}
      <mesh rotation-x={-Math.PI / 2} position-y={0} receiveShadow>
        <circleGeometry args={[19, 48]} />
        <meshStandardMaterial map={concrete} roughness={0.95} />
      </mesh>
      {/* 大木まわりの土 */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -14]} receiveShadow>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial map={dirt} roughness={1} />
      </mesh>
      {/* アスファルトの道（入口→広場） */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, 28]} receiveShadow>
        <planeGeometry args={[7, 34]} />
        <meshStandardMaterial map={asphalt} roughness={0.9} />
      </mesh>
      {/* センターライン */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0.02, 14 + i * 3]}>
          <planeGeometry args={[0.4, 1.4]} />
          <meshBasicMaterial color="#e9e4d2" />
        </mesh>
      ))}
      {/* ブランドの円（広場の床マーク） */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, -6]}>
        <ringGeometry args={[9.4, 9.8, 64]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// ============ 空（グラデーションドーム＋雲） ============
function SkyDome() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 16;
    c.height = 256;
    const x = c.getContext("2d")!;
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#3f8fd6");
    g.addColorStop(0.55, "#9ec9ea");
    g.addColorStop(1, "#e3f0f8");
    x.fillStyle = g;
    x.fillRect(0, 0, 16, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh>
      <sphereGeometry args={[200, 32, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} />
    </mesh>
  );
}

function PuffCloud({ pos, s = 4 }: { pos: [number, number, number]; s?: number }) {
  const parts: [number, number, number, number][] = [
    [0, 0, 0, 1],
    [1.1, 0.1, 0, 0.8],
    [-1.1, 0, 0, 0.75],
    [0.5, 0.35, 0.3, 0.7],
    [-0.5, 0.3, -0.2, 0.65],
  ];
  return (
    <group position={pos} scale={[s, s * 0.65, s]}>
      {parts.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]}>
          <sphereGeometry args={[p[3], 12, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} fog={false} />
        </mesh>
      ))}
    </group>
  );
}

// ============ ライト（昼） ============
const SUN_POS: [number, number, number] = [60, 50, 30];
function Lights() {
  return (
    <>
      <hemisphereLight args={["#cfe6ff", "#86a06a", 1.1]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={SUN_POS}
        intensity={2.4}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-camera-left={-44}
        shadow-camera-right={44}
        shadow-camera-top={44}
        shadow-camera-bottom={-44}
        shadow-bias={-0.0004}
      />
    </>
  );
}

// ============ 建物（街） ============
function Building({ b }: { b: Bld }) {
  const [w, h, d] = b.size;
  const floors = Math.max(2, Math.round(h / 2.6));
  return (
    <group position={[b.pos[0], 0, b.pos[1]]}>
      <mesh position-y={h / 2} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={b.wall} roughness={0.85} />
      </mesh>
      {/* 屋根 */}
      {b.roofType === "flat" ? (
        <mesh position-y={h + 0.2} castShadow>
          <boxGeometry args={[w * 1.04, 0.5, d * 1.04]} />
          <meshStandardMaterial color={b.roof} roughness={0.8} />
        </mesh>
      ) : (
        <mesh position-y={h + h * 0.18} rotation-y={Math.PI / 4} castShadow scale={[1, 1, d / w]}>
          <cylinderGeometry args={[0.001, w * 0.78, h * 0.4, 4]} />
          <meshStandardMaterial color={b.roof} roughness={0.8} />
        </mesh>
      )}
      {/* 窓 */}
      {Array.from({ length: floors }).map((_, f) =>
        [-1, 1].map((sx) => (
          <mesh key={`${f}-${sx}`} position={[sx * w * 0.24, 1.6 + f * (h / floors), d / 2 + 0.05]}>
            <planeGeometry args={[w * 0.28, 0.9]} />
            <meshStandardMaterial color="#aee0ff" emissive="#bfe9ff" emissiveIntensity={0.25} metalness={0.3} roughness={0.2} />
          </mesh>
        ))
      )}
      {/* ドア */}
      <mesh position={[0, 1.1, d / 2 + 0.06]}>
        <planeGeometry args={[w * 0.18, 2.0]} />
        <meshStandardMaterial color="#5a4632" roughness={0.7} />
      </mesh>
      {/* 看板 */}
      {b.sign && (
        <Html position={[0, h * 0.62, d / 2 + 0.15]} center distanceFactor={16} zIndexRange={[18, 0]}>
          <div
            style={{
              padding: "6px 18px",
              borderRadius: 8,
              background: "#10243f",
              border: `2px solid ${ACCENT}`,
              color: "#fff",
              fontFamily: "var(--font-oswald), sans-serif",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 3,
              whiteSpace: "nowrap",
            }}
          >
            {b.sign}
          </div>
        </Html>
      )}
    </group>
  );
}

// ============ りんごの木 ============
function AppleTree({ pos, s = 1 }: { pos: [number, number]; s?: number }) {
  const apples = useMemo(
    () =>
      Array.from({ length: 5 }).map(() => [
        (Math.random() - 0.5) * 2.2 * s,
        (2.0 + Math.random() * 1.1) * s,
        (Math.random() - 0.5) * 2.2 * s,
      ] as [number, number, number]),
    [s]
  );
  return (
    <group position={[pos[0], 0, pos[1]]}>
      <mesh position-y={0.95 * s} castShadow>
        <cylinderGeometry args={[0.2 * s, 0.3 * s, 1.9 * s, 9]} />
        <meshStandardMaterial color="#6e4f2f" roughness={0.95} />
      </mesh>
      {[
        [0, 2.5, 0, 1.5],
        [0.7, 2.1, 0.3, 1.0],
        [-0.7, 2.2, -0.2, 1.05],
        [0.2, 3.0, -0.4, 0.9],
      ].map((f, i) => (
        <mesh key={i} position={[f[0] * s, f[1] * s, f[2] * s]} scale={[1, 0.92, 1]} castShadow>
          <icosahedronGeometry args={[f[3] * s, 1]} />
          <meshStandardMaterial color={["#3f9a4a", "#56b35e", "#4a9e44", "#62bd66"][i]} roughness={0.85} flatShading />
        </mesh>
      ))}
      {apples.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.18 * s, 10, 8]} />
          <meshStandardMaterial color="#e23b2e" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ============ シンボルの大木（気になる木＝りんご） ============
function SymbolTree() {
  const apples = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 2.4 + Math.random() * 1.6;
        return [Math.sin(a) * r, 7.2 + (Math.random() - 0.5) * 2.4, Math.cos(a) * r] as [number, number, number];
      }),
    []
  );
  return (
    <group position={[0, 0, -14]}>
      <mesh position-y={3.4} castShadow>
        <cylinderGeometry args={[0.8, 1.45, 7, 14]} />
        <meshStandardMaterial color="#6e5436" roughness={0.95} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 1.2, 0.35, Math.cos(a) * 1.2]} rotation-z={Math.sin(a) * 0.5} rotation-x={Math.cos(a) * 0.5} castShadow>
            <cylinderGeometry args={[0.16, 0.4, 1.4, 7]} />
            <meshStandardMaterial color="#5e4628" roughness={0.95} />
          </mesh>
        );
      })}
      {[
        [0, 8.4, 0, 4.0, "#3f9a4a"],
        [3, 7.6, 1, 2.9, "#56b35e"],
        [-3, 7.8, -1, 3.0, "#4a9e44"],
        [1, 9.8, -2, 2.6, "#62bd66"],
        [-1.5, 9.6, 2, 2.5, "#3f9a4a"],
      ].map((f, i) => (
        <mesh key={i} position={[f[0] as number, f[1] as number, f[2] as number]} scale={[1, 0.95, 1]} castShadow>
          <icosahedronGeometry args={[f[3] as number, 1]} />
          <meshStandardMaterial color={f[4] as string} roughness={0.85} flatShading />
        </mesh>
      ))}
      {/* たわわなりんご（実＝成果） */}
      {apples.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.32, 12, 10]} />
          <meshStandardMaterial color="#e23b2e" roughness={0.35} />
        </mesh>
      ))}
      {/* サイネージ */}
      <Html position={[0, 4.4, 2.4]} center distanceFactor={13} zIndexRange={[18, 0]}>
        <div
          style={{
            whiteSpace: "nowrap",
            padding: "10px 22px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.94)",
            border: `3px solid ${ACCENT}`,
            color: "#1f2a1c",
            fontWeight: 900,
            fontFamily: "var(--font-noto-sans-jp), sans-serif",
            boxShadow: "0 6px 18px rgba(0,0,0,.25)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 26, letterSpacing: 2 }}>木まぐれ</div>
          <div style={{ fontSize: 11, color: "#b89e10", letterSpacing: 4 }}>〜 気になる木 〜</div>
        </div>
      </Html>
    </group>
  );
}

// ============ 街の小物 ============
function StreetProps() {
  const lamp = (x: number, z: number) => (
    <group key={`l${x}-${z}`} position={[x, 0, z]}>
      <mesh position-y={1.6} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 3.2, 8]} />
        <meshStandardMaterial color="#2f3640" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.4, 3.2, 0]} castShadow>
        <boxGeometry args={[0.9, 0.15, 0.3]} />
        <meshStandardMaterial color="#2f3640" />
      </mesh>
      <mesh position={[0.7, 3.1, 0]}>
        <boxGeometry args={[0.3, 0.12, 0.25]} />
        <meshStandardMaterial color="#fff6d8" emissive="#fff0c0" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
  const bench = (x: number, z: number, ry: number) => (
    <group key={`b${x}-${z}`} position={[x, 0, z]} rotation-y={ry}>
      <mesh position-y={0.45} castShadow>
        <boxGeometry args={[1.6, 0.1, 0.5]} />
        <meshStandardMaterial color="#9c7a48" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.5, 0.1]} />
        <meshStandardMaterial color="#9c7a48" roughness={0.8} />
      </mesh>
      {[-0.7, 0.7].map((sx) => (
        <mesh key={sx} position={[sx, 0.22, 0]}>
          <boxGeometry args={[0.1, 0.45, 0.5]} />
          <meshStandardMaterial color="#3a424c" metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
  const planter = (x: number, z: number) => (
    <group key={`p${x}-${z}`} position={[x, 0, z]}>
      <mesh position-y={0.3} castShadow>
        <boxGeometry args={[1.0, 0.6, 1.0]} />
        <meshStandardMaterial color="#b9b2a3" roughness={0.9} />
      </mesh>
      <mesh position-y={0.8} castShadow>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial color="#4a9e44" roughness={0.85} flatShading />
      </mesh>
    </group>
  );
  return (
    <group>
      {lamp(-7, 12)}
      {lamp(7, 12)}
      {lamp(-7, 0)}
      {lamp(7, 0)}
      {bench(-9, 6, 0.4)}
      {bench(9, 5, -0.4)}
      {planter(-4, 12)}
      {planter(4, 12)}
      {/* 簡単な車（街の生活感） */}
      <group position={[-13, 0, 18]} rotation-y={0.3}>
        <mesh position-y={0.7} castShadow>
          <boxGeometry args={[2.2, 0.7, 4.2]} />
          <meshStandardMaterial color="#d23b3b" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position-y={1.2} castShadow>
          <boxGeometry args={[1.9, 0.7, 2.2]} />
          <meshStandardMaterial color="#b83030" roughness={0.4} metalness={0.3} />
        </mesh>
        {[
          [-1.0, 1.6],
          [1.0, 1.6],
          [-1.0, -1.6],
          [1.0, -1.6],
        ].map(([wx, wz], i) => (
          <mesh key={i} position={[wx, 0.4, wz]} rotation-z={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 12]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ============ キャラクター ============
type Parts = {
  legL: THREE.Mesh | null;
  legR: THREE.Mesh | null;
  armL: THREE.Mesh | null;
  armR: THREE.Mesh | null;
  torso: THREE.Group | null;
};

function Head({
  skin,
  hair,
  glasses,
  beard,
  accessory = "none",
}: {
  skin: string;
  hair: string;
  glasses?: boolean;
  beard?: boolean;
  accessory?: Npc["accessory"];
}) {
  return (
    <group position-y={2.36}>
      {/* 顔 */}
      <RoundedBox args={[0.6, 0.62, 0.6]} radius={0.16} smoothness={3} castShadow>
        <meshStandardMaterial color={skin} roughness={0.55} />
      </RoundedBox>
      {/* 目（白目＋瞳） */}
      {[-0.14, 0.14].map((ex) => (
        <group key={ex}>
          <mesh position={[ex, 0.04, 0.3]}>
            <boxGeometry args={[0.13, 0.15, 0.04]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          <mesh position={[ex, 0.03, 0.33]}>
            <boxGeometry args={[0.06, 0.08, 0.03]} />
            <meshStandardMaterial color="#23303a" />
          </mesh>
          {/* 眉 */}
          <mesh position={[ex, 0.18, 0.31]}>
            <boxGeometry args={[0.15, 0.03, 0.03]} />
            <meshStandardMaterial color={hair} />
          </mesh>
        </group>
      ))}
      {/* 鼻 */}
      <mesh position={[0, -0.04, 0.33]}>
        <boxGeometry args={[0.07, 0.1, 0.07]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      {/* 口 */}
      <mesh position={[0, -0.18, 0.31]}>
        <boxGeometry args={[0.16, 0.03, 0.03]} />
        <meshStandardMaterial color="#9c5b4a" />
      </mesh>
      {/* メガネ */}
      {glasses && (
        <group position={[0, 0.04, 0.34]}>
          {[-0.14, 0.14].map((ex) => (
            <mesh key={ex} position={[ex, 0, 0]}>
              <torusGeometry args={[0.1, 0.018, 8, 16]} />
              <meshStandardMaterial color="#202428" metalness={0.4} />
            </mesh>
          ))}
          <mesh>
            <boxGeometry args={[0.1, 0.02, 0.02]} />
            <meshStandardMaterial color="#202428" metalness={0.4} />
          </mesh>
        </group>
      )}
      {/* ヒゲ */}
      {beard && (
        <mesh position={[0, -0.2, 0.26]}>
          <boxGeometry args={[0.46, 0.2, 0.16]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
      )}
      {/* 髪（頭頂） */}
      <RoundedBox args={[0.68, 0.34, 0.66]} radius={0.12} smoothness={3} position-y={0.3} castShadow>
        <meshStandardMaterial color={hair} roughness={0.8} />
      </RoundedBox>
      {accessory !== "beret" && accessory !== "cap" && (
        <mesh position={[0, 0.14, 0.32]}>
          <boxGeometry args={[0.66, 0.14, 0.05]} />
          <meshStandardMaterial color={hair} roughness={0.8} />
        </mesh>
      )}
      {/* ロングヘア */}
      {accessory === "long" &&
        [-0.34, 0.34].map((sx) => (
          <mesh key={sx} position={[sx, -0.18, -0.04]} castShadow>
            <boxGeometry args={[0.12, 0.5, 0.5]} />
            <meshStandardMaterial color={hair} roughness={0.8} />
          </mesh>
        ))}
      {/* ヘッドホン */}
      {accessory === "headphones" && (
        <group>
          <mesh position={[0, 0.36, 0]} rotation-z={Math.PI / 2}>
            <torusGeometry args={[0.34, 0.04, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#1f2429" />
          </mesh>
          {[-0.36, 0.36].map((sx) => (
            <mesh key={sx} position={[sx, 0.02, 0]} rotation-z={Math.PI / 2}>
              <cylinderGeometry args={[0.12, 0.12, 0.1, 12]} />
              <meshStandardMaterial color="#1f2429" />
            </mesh>
          ))}
        </group>
      )}
      {/* ベレー帽 */}
      {accessory === "beret" && (
        <mesh position={[0.06, 0.4, -0.02]} rotation-z={-0.18} castShadow>
          <cylinderGeometry args={[0.42, 0.36, 0.16, 16]} />
          <meshStandardMaterial color="#2f2f3a" roughness={0.85} />
        </mesh>
      )}
      {/* キャップ */}
      {accessory === "cap" && (
        <group>
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.37, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#234a8a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.4, 0.34]}>
            <boxGeometry args={[0.5, 0.06, 0.34]} />
            <meshStandardMaterial color="#1c3a6e" roughness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function CharacterModel({
  skin,
  top,
  bottom,
  hair,
  tie = "#c9302c",
  glasses,
  beard,
  accessory = "none",
  partsRef,
}: {
  skin: string;
  top: string;
  bottom: string;
  hair: string;
  tie?: string;
  glasses?: boolean;
  beard?: boolean;
  accessory?: Npc["accessory"];
  partsRef?: React.MutableRefObject<Parts>;
}) {
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const armL = useRef<THREE.Mesh>(null);
  const armR = useRef<THREE.Mesh>(null);
  const torso = useRef<THREE.Group>(null);
  useEffect(() => {
    if (partsRef) {
      partsRef.current = { legL: legL.current, legR: legR.current, armL: armL.current, armR: armR.current, torso: torso.current };
    }
  }, [partsRef]);
  return (
    <group>
      {/* スラックス＋革靴 */}
      {[-0.19, 0.19].map((lx, i) => (
        <mesh key={lx} ref={i === 0 ? legL : legR} position={[lx, 0.52, 0]} castShadow>
          <boxGeometry args={[0.28, 0.95, 0.28]} />
          <meshStandardMaterial color={bottom} roughness={0.7} />
          <mesh position={[0, -0.5, 0.07]} castShadow>
            <boxGeometry args={[0.3, 0.16, 0.42]} />
            <meshStandardMaterial color="#15171b" roughness={0.4} />
          </mesh>
        </mesh>
      ))}
      {/* ジャケット＋シャツ＋ネクタイ */}
      <group ref={torso} position-y={1.5}>
        <RoundedBox args={[0.92, 1.08, 0.56]} radius={0.14} smoothness={3} castShadow>
          <meshStandardMaterial color={top} roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, 0.04, 0.28]}>
          <boxGeometry args={[0.3, 0.96, 0.04]} />
          <meshStandardMaterial color="#f4f5f7" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.31]}>
          <boxGeometry args={[0.1, 0.6, 0.03]} />
          <meshStandardMaterial color={tie} roughness={0.5} />
        </mesh>
        <mesh position={[0.16, -0.16, 0.3]}>
          <boxGeometry args={[0.16, 0.22, 0.02]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.3} />
        </mesh>
      </group>
      {/* 首 */}
      <mesh position-y={2.02} castShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.2, 10]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      {/* 袖＋手 */}
      {[-0.6, 0.6].map((ax, i) => (
        <mesh key={ax} ref={i === 0 ? armL : armR} position={[ax, 1.5, 0]} castShadow>
          <boxGeometry args={[0.24, 0.92, 0.26]} />
          <meshStandardMaterial color={top} roughness={0.6} />
          <mesh position={[0, -0.52, 0]} castShadow>
            <boxGeometry args={[0.2, 0.18, 0.22]} />
            <meshStandardMaterial color={skin} roughness={0.55} />
          </mesh>
        </mesh>
      ))}
      {/* 頭・顔 */}
      <Head skin={skin} hair={hair} glasses={glasses} beard={beard} accessory={accessory} />
    </group>
  );
}

// ============ NPC ============
function NpcView({ npc }: { npc: Npc }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const talked = useGame((s) => s.talked.includes(npc.id));
  const near = useGame((s) => s.nearId === npc.id);
  const started = useGame((s) => s.started);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) group.current.position.y = Math.sin(t * 1.5 + npc.pos[0]) * 0.05;
    if (ring.current) {
      ring.current.rotation.z = t * 0.8;
      const sc = 1 + Math.sin(t * 3) * 0.06;
      ring.current.scale.set(sc, sc, sc);
    }
  });

  return (
    <group position={[npc.pos[0], 0, npc.pos[1]]} rotation-y={npc.ry}>
      <group ref={group}>
        <CharacterModel
          skin={npc.skin}
          top={npc.top}
          bottom={npc.bottom}
          hair={npc.hair}
          tie={npc.tie}
          glasses={npc.glasses}
          beard={npc.beard}
          accessory={npc.accessory}
        />
      </group>
      {!talked && (
        <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.08}>
          <torusGeometry args={[0.95, 0.08, 10, 32]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      )}
      {started && (
        <Html position={[0, 3.5, 0]} center distanceFactor={11} zIndexRange={[20, 0]}>
          <div
            style={{
              whiteSpace: "nowrap",
              transform: "translateY(-50%)",
              padding: "5px 12px",
              borderRadius: 999,
              background: talked ? "rgba(20,28,18,0.7)" : "rgba(255,255,255,0.95)",
              border: `2px solid ${talked ? "#9aa08f" : ACCENT}`,
              color: talked ? "#fff" : "#1f2a1c",
              fontSize: 11,
              fontWeight: 800,
              fontFamily: "var(--font-noto-sans-jp), sans-serif",
              boxShadow: near ? `0 0 16px ${ACCENT}` : "0 4px 12px rgba(0,0,0,.25)",
              opacity: talked ? 0.75 : 1,
            }}
          >
            {talked ? "✓ " : ""}
            {npc.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// ============ プレイヤー（操作＋追従カメラ） ============
function Player() {
  const group = useRef<THREE.Group>(null);
  const parts = useRef<Parts>({ legL: null, legR: null, armL: null, armR: null, torso: null });
  const facing = useRef(Math.PI);
  const camYaw = useRef(Math.PI);
  const walk = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const setNear = useGame((s) => s.setNear);
  const started = useGame((s) => s.started);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const g = group.current;
    if (!g) return;
    const { started: isStarted, dialogue } = useGame.getState();

    let moving = false;
    if (isStarted && !dialogue) {
      const ix = input.x;
      const iz = input.z;
      const mag = Math.min(Math.hypot(ix, iz), 1);
      if (mag > 0.05) {
        const cy = camYaw.current;
        let dx = Math.cos(cy) * ix + Math.sin(cy) * -iz;
        let dz = -Math.sin(cy) * ix + Math.cos(cy) * -iz;
        const dl = Math.hypot(dx, dz) || 1;
        dx /= dl;
        dz /= dl;
        const sp = 7.4 * mag;
        let nx = g.position.x + dx * sp * dt;
        let nz = g.position.z + dz * sp * dt;
        for (const c of COLLIDERS) {
          const ox = nx - c.x;
          const oz = nz - c.z;
          const d = Math.hypot(ox, oz);
          const min = c.r + 0.5;
          if (d < min && d > 0.0001) {
            nx = c.x + (ox / d) * min;
            nz = c.z + (oz / d) * min;
          }
        }
        const R = 30;
        const dd = Math.hypot(nx, nz);
        if (dd > R) {
          nx = (nx / dd) * R;
          nz = (nz / dd) * R;
        }
        g.position.x = nx;
        g.position.z = nz;
        let diff = Math.atan2(dx, dz) - facing.current;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        facing.current += diff * 0.2;
        moving = true;
        walk.current += dt * sp * 1.4;
      }
    }
    g.rotation.y = facing.current;

    const p = parts.current;
    if (moving && p.legL && p.legR && p.armL && p.armR) {
      const s = Math.sin(walk.current * 2.2);
      p.legL.rotation.x = s * 0.6;
      p.legR.rotation.x = -s * 0.6;
      p.armL.rotation.x = -s * 0.5;
      p.armR.rotation.x = s * 0.5;
    } else if (p.legL && p.legR && p.armL && p.armR) {
      p.legL.rotation.x *= 0.8;
      p.legR.rotation.x *= 0.8;
      p.armL.rotation.x *= 0.8;
      p.armR.rotation.x *= 0.8;
    }

    let nearId: string | null = null;
    let best = 2.6;
    for (const n of NPCS) {
      const d = Math.hypot(g.position.x - n.pos[0], g.position.z - n.pos[1]);
      if (d < best) {
        best = d;
        nearId = n.id;
      }
    }
    setNear(nearId);

    let yd = facing.current - camYaw.current;
    while (yd > Math.PI) yd -= Math.PI * 2;
    while (yd < -Math.PI) yd += Math.PI * 2;
    camYaw.current += yd * (moving ? 0.06 : 0.03);
    const cx = g.position.x - Math.sin(camYaw.current) * 9.5;
    const cz = g.position.z - Math.cos(camYaw.current) * 9.5;
    state.camera.position.x += (cx - state.camera.position.x) * 0.1;
    state.camera.position.z += (cz - state.camera.position.z) * 0.1;
    state.camera.position.y += (5.6 - state.camera.position.y) * 0.1;
    tmp.set(g.position.x, 1.7, g.position.z);
    state.camera.lookAt(tmp);
  });

  return (
    <group ref={group} position={[0, 0, 15]}>
      <CharacterModel skin="#e9b98f" top="#33424f" bottom="#222a32" hair="#3a2a22" tie="#4fe3d0" accessory="none" partsRef={parts} />
      {started && (
        <Html position={[0, 3.4, 0]} center distanceFactor={12} zIndexRange={[20, 0]}>
          <div
            style={{
              padding: "3px 10px",
              borderRadius: 999,
              background: "#4fe3d0",
              color: "#06231e",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1,
              fontFamily: "var(--font-oswald), sans-serif",
              boxShadow: "0 0 12px #4fe3d0",
            }}
          >
            GUEST · YOU
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Scene() {
  return (
    <>
      <color attach="background" args={["#bfe0f2"]} />
      <SkyDome />
      <fog attach="fog" args={["#d4e6f0", 60, 130]} />
      <Lights />
      <PuffCloud pos={[-20, 24, -24]} s={4.5} />
      <PuffCloud pos={[22, 28, -12]} s={5} />
      <PuffCloud pos={[2, 30, 28]} s={4} />
      <PuffCloud pos={[-26, 26, 10]} s={4} />
      <Ground />
      {BUILDINGS.map((b, i) => (
        <Building key={i} b={b} />
      ))}
      <SymbolTree />
      <StreetProps />
      <AppleTree pos={[-12, 4]} s={1.1} />
      <AppleTree pos={[12, 5]} s={1} />
      <AppleTree pos={[-9, -10]} s={0.9} />
      <AppleTree pos={[10, -11]} s={1.05} />
      <AppleTree pos={[-16, 16]} s={1.2} />
      <AppleTree pos={[16, 16]} s={1.1} />
      {NPCS.map((n) => (
        <NpcView key={n.id} npc={n} />
      ))}
      <Player />
    </>
  );
}
