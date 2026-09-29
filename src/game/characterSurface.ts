import * as THREE from "three";

// Meshy exports split vertices per UV island; averaging only indexed normals
// leaves the face faceted. Share normals by position without changing the UVs,
// skin weights, or topology of the original model.
export function smoothCharacterGeometry(source: THREE.BufferGeometry) {
  const geometry = source.clone();
  geometry.computeVertexNormals();
  const position = geometry.getAttribute("position"), normal = geometry.getAttribute("normal");
  const sums = new Map<string, THREE.Vector3>();
  const keys: string[] = [];
  for (let i = 0; i < position.count; i++) {
    const key = `${Math.round(position.getX(i) * 100000)},${Math.round(position.getY(i) * 100000)},${Math.round(position.getZ(i) * 100000)}`;
    keys.push(key);
    const sum = sums.get(key) ?? new THREE.Vector3();
    sum.x += normal.getX(i); sum.y += normal.getY(i); sum.z += normal.getZ(i);
    sums.set(key, sum);
  }
  for (const sum of sums.values()) sum.normalize();
  for (let i = 0; i < position.count; i++) {
    const n = sums.get(keys[i])!;
    normal.setXYZ(i, n.x, n.y, n.z);
  }
  return geometry;
}

export function naturalCharacterMaterial(source: THREE.Material) {
  const material = source.clone();
  if (material instanceof THREE.MeshStandardMaterial) {
    material.flatShading = false;
    material.metalness = 0;
    material.roughness = 0.68;
    // The low-poly normal bake amplifies triangular cheek/nose shadows.
    material.normalMap = null;
    material.roughnessMap = null;
    material.aoMapIntensity = 0.25;
    material.envMapIntensity = 0.18;
    material.emissive.set("#fff1e9");
    material.emissiveMap = material.map;
    material.emissiveIntensity = 0.045;
  }
  return material;
}
