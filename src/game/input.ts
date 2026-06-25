// 高頻度で更新する移動入力は、再レンダーを避けるためモジュール共有の可変オブジェクトで持つ。
export const input = { x: 0, z: 0 };

const keys = new Set<string>();
const MAP: Record<string, "up" | "down" | "left" | "right"> = {
  w: "up",
  arrowup: "up",
  s: "down",
  arrowdown: "down",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
};

function recompute() {
  let x = 0;
  let z = 0;
  for (const k of keys) {
    const dir = MAP[k];
    if (dir === "up") z -= 1;
    else if (dir === "down") z += 1;
    else if (dir === "left") x -= 1;
    else if (dir === "right") x += 1;
  }
  const len = Math.hypot(x, z);
  if (len > 1) {
    x /= len;
    z /= len;
  }
  input.x = x;
  input.z = z;
}

export function pressKey(key: string) {
  const k = key.toLowerCase();
  if (!(k in MAP)) return;
  keys.add(k);
  recompute();
}

export function releaseKey(key: string) {
  const k = key.toLowerCase();
  if (!(k in MAP)) return;
  keys.delete(k);
  recompute();
}

// モバイルジョイスティック等から直接入力するための上書き口
export function setStick(x: number, z: number) {
  input.x = Math.max(-1, Math.min(1, x));
  input.z = Math.max(-1, Math.min(1, z));
}

export function clearStick() {
  recompute(); // キーボード状態に戻す
}
