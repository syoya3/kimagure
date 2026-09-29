// Reproducible mobile derivatives. Originals and all character/animation data stay intact.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { MeshoptSimplifier } from 'meshoptimizer';

const root = 'public/models/tech-campus';
const names = ['office', 'nagi', 'miki', 'sora', 'tsudoi', 'taiju', 'guest-rerig-run-retargeted'];
await fs.mkdir(`${root}/mobile`, { recursive: true });
await MeshoptSimplifier.ready;
const report = [];
for (const name of names) {
  const input = await fs.readFile(`${root}/${name}.glb`);
  const jsonSize = input.readUInt32LE(12);
  const json = JSON.parse(input.subarray(20, 20 + jsonSize).toString());
  const bin = input.subarray(28 + jsonSize);
  const views = json.bufferViews.map(v => Buffer.from(bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength)));
  const trianglesBefore = json.meshes.reduce((sum, m) => sum + m.primitives.reduce((s, p) => s + json.accessors[p.indices].count / 3, 0), 0);

  if (name === 'office') {
    const p = json.meshes[0].primitives[0];
    const positions = new Float32Array(views[json.accessors[p.attributes.POSITION].bufferView].buffer.slice(views[json.accessors[p.attributes.POSITION].bufferView].byteOffset, views[json.accessors[p.attributes.POSITION].bufferView].byteOffset + views[json.accessors[p.attributes.POSITION].bufferView].byteLength));
    const indexAccessor = json.accessors[p.indices];
    const indexBytes = views[indexAccessor.bufferView];
    const indices = new Uint32Array(indexBytes.buffer.slice(indexBytes.byteOffset, indexBytes.byteOffset + indexBytes.byteLength));
    const uvBytes = views[json.accessors[p.attributes.TEXCOORD_0].bufferView];
    const uv = new Float32Array(uvBytes.buffer.slice(uvBytes.byteOffset, uvBytes.byteOffset + uvBytes.byteLength));
    const [reduced] = MeshoptSimplifier.simplifyWithAttributes(indices, positions, 3, uv, 2, [0.2, 0.2], null, 100000 * 3, 0.01, ['Permissive']);
    const [remap, count] = MeshoptSimplifier.compactMesh(reduced);
    // compactMesh rewrites reduced indices; remap maps old vertex -> new vertex.
    for (const accessorId of Object.values(p.attributes)) {
      const a = json.accessors[accessorId], source = views[a.bufferView];
      const stride = (a.type === 'VEC3' ? 3 : 2) * 4;
      const packed = Buffer.alloc(count * stride);
      for (let i = 0; i < remap.length; i++) if (remap[i] !== 0xffffffff) source.copy(packed, remap[i] * stride, i * stride, (i + 1) * stride);
      views[a.bufferView] = packed; a.count = count; a.byteOffset = 0;
      delete a.min; delete a.max;
      if (accessorId === p.attributes.POSITION) {
        const values = new Float32Array(packed.buffer, packed.byteOffset, count * 3);
        a.min = [Infinity, Infinity, Infinity]; a.max = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < values.length; i++) { a.min[i % 3] = Math.min(a.min[i % 3], values[i]); a.max[i % 3] = Math.max(a.max[i % 3], values[i]); }
      }
    }
    views[indexAccessor.bufferView] = Buffer.from(reduced.buffer, reduced.byteOffset, reduced.byteLength);
    indexAccessor.count = reduced.length; indexAccessor.byteOffset = 0;
    delete indexAccessor.min; delete indexAccessor.max;
  } else {
    // Runtime already ignores the generated normal/roughness bakes for natural skin.
    for (const material of json.materials ?? []) {
      delete material.normalTexture; delete material.occlusionTexture;
      if (material.pbrMetallicRoughness) delete material.pbrMetallicRoughness.metallicRoughnessTexture;
    }
  }

  // Keep only textures actually referenced by materials, then repack reachable views.
  const textureIds = new Set();
  const visit = (value, fn) => { for (const [key, child] of Object.entries(value ?? {})) if (child && typeof child === 'object') { if (key.endsWith('Texture') && Number.isInteger(child.index)) fn(child); else visit(child, fn); } };
  for (const m of json.materials ?? []) visit(m, t => textureIds.add(t.index));
  const textures = [...textureIds];
  for (const m of json.materials ?? []) visit(m, t => { t.index = textures.indexOf(t.index); });
  json.textures = textures.map(id => json.textures[id]);
  const imageIds = [...new Set(json.textures.map(t => t.source))];
  json.images = imageIds.map(id => json.images[id]);
  json.textures.forEach(t => { t.source = imageIds.indexOf(t.source); });
  for (const image of json.images) {
    const original = views[image.bufferView];
    const resized = sharp(original).resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true });
    views[image.bufferView] = image.mimeType === 'image/png' ? await resized.png().toBuffer() : await resized.jpeg({ quality: 84 }).toBuffer();
  }
  const reachable = new Set(json.accessors.filter(a => a.bufferView !== undefined).map(a => a.bufferView));
  for (const image of json.images) reachable.add(image.bufferView);
  const ids = [...reachable];
  for (const a of json.accessors) if (a.bufferView !== undefined) a.bufferView = ids.indexOf(a.bufferView);
  for (const image of json.images) image.bufferView = ids.indexOf(image.bufferView);
  let offset = 0; const chunks = [];
  json.bufferViews = ids.map(id => {
    const bytes = views[id], old = json.bufferViews[id];
    const view = { ...old, buffer: 0, byteOffset: offset, byteLength: bytes.length };
    const padded = Buffer.alloc(Math.ceil(bytes.length / 4) * 4); bytes.copy(padded); chunks.push(padded); offset += padded.length;
    return view;
  });
  json.buffers = [{ byteLength: offset }];
  const encoded = Buffer.from(JSON.stringify(json));
  const padded = Buffer.alloc(Math.ceil(encoded.length / 4) * 4, 32); encoded.copy(padded);
  const header = Buffer.alloc(20); header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + padded.length + offset, 8); header.writeUInt32LE(padded.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
  const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(offset); binHeader.writeUInt32LE(0x004e4942, 4);
  const output = Buffer.concat([header, padded, binHeader, ...chunks]);
  await fs.writeFile(`${root}/mobile/${name}.glb`, output);
  report.push({ name, bytesBefore: input.length, bytesAfter: output.length, trianglesBefore, trianglesAfter: json.meshes.reduce((sum, m) => sum + m.primitives.reduce((s, p) => s + json.accessors[p.indices].count / 3, 0), 0) });
}
await fs.writeFile('docs/mobile-asset-report.json', JSON.stringify(report, null, 2) + '\n');
console.table(report);
