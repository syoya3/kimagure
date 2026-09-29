import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { frameDue, lowerDpr } from '../src/game/renderBudget.ts';

for (const refresh of [60, 90, 120]) {
  let previous = 0, frames = 0;
  for (let i = 1; i <= refresh * 60; i++) {
    const due = frameDue(i * 1000 / refresh, previous, 1000 / 30);
    if (due !== null) { previous = due; frames++; }
  }
  assert.equal(frames, 1800, `30 fps pacing on ${refresh} Hz display`);
}
assert.equal(lowerDpr(1.25, 30), 1.25);
assert.equal(lowerDpr(1.25, 20), 1.05);
assert.equal(lowerDpr(.85, 12), .85);

async function read(name, mobile = false) {
  const b = await fs.readFile(`public/models/tech-campus/${mobile ? 'mobile/' : ''}${name}.glb`);
  assert.equal(b.readUInt32LE(8), b.length);
  const length = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + length));
  const bin = b.subarray(28 + length);
  const view = id => { const v = json.bufferViews[id]; return bin.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength); };
  for (const v of json.bufferViews) assert.ok((v.byteOffset ?? 0) + v.byteLength <= bin.length);
  for (const image of json.images) {
    const { width, height } = await sharp(view(image.bufferView)).metadata();
    if (mobile) assert.ok(width <= 1024 && height <= 1024);
  }
  return { json, view, bytes: b.length };
}
let before = 0, after = 0;
for (const name of ['office', 'nagi', 'miki', 'sora', 'tsudoi', 'taiju', 'guest-rerig-run-retargeted']) {
  const original = await read(name), mobile = await read(name, true);
  before += original.bytes; after += mobile.bytes;
  if (name !== 'office') {
    // Every geometry, skin, inverse bind matrix and animation accessor is exact.
    assert.deepEqual(mobile.json.nodes, original.json.nodes);
    assert.deepEqual(mobile.json.animations, original.json.animations);
    assert.deepEqual(mobile.json.skins, original.json.skins);
    for (let i = 0; i < original.json.accessors.length; i++) {
      const a = original.json.accessors[i], b = mobile.json.accessors[i];
      assert.deepEqual({ ...a, bufferView: 0 }, { ...b, bufferView: 0 });
      assert.deepEqual(mobile.view(b.bufferView), original.view(a.bufferView), `${name} accessor ${i} preserved`);
    }
  } else {
    const p = mobile.json.meshes[0].primitives[0];
    const indices = mobile.json.accessors[p.indices];
    assert.ok(indices.count / 3 <= 100000);
    const vertices = mobile.json.accessors[p.attributes.POSITION].count;
    const bytes = mobile.view(indices.bufferView);
    for (let i = 0; i < indices.count; i++) assert.ok(bytes.readUInt32LE(i * 4) < vertices);
    for (const id of Object.values(p.attributes)) assert.equal(mobile.json.accessors[id].count, vertices);
  }
}
assert.ok(after < before * .12, 'mobile models below 12% of original download');
console.log({ status: 'passed', refreshRates: [60, 90, 120], allCharacterAccessorsUnchanged: true, bytesBefore: before, bytesAfter: after, reduction: `${(100 * (1 - after / before)).toFixed(1)}%` });
