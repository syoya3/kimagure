import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self = globalThis;
globalThis.ProgressEvent ??= class { constructor(type, init) { Object.assign(this, {type}, init); } };
async function readRig(name) {
  const bytes = await fs.readFile(name.includes('/') ? name : `public/models/tech-campus/${name}.glb`);
  const jsonLength = bytes.readUInt32LE(12), json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const binaryOffset = 20 + jsonLength + 8;
  json.buffers[0].uri = `data:application/octet-stream;base64,${bytes.subarray(binaryOffset).toString('base64')}`;
  // Headless inspection only: omit texture decoding; the GLB on disk is untouched.
  delete json.images; delete json.textures; delete json.materials;
  for (const mesh of json.meshes??[]) for (const primitive of mesh.primitives) delete primitive.material;
  return new GLTFLoader().parseAsync(JSON.stringify(json), '');
}


const results=[];
for(const file of ['guest-run-fast','guest-rerig-run-retargeted']){
 const {scene,animations}=await readRig(file);scene.updateMatrixWorld(true);
 const bone=n=>scene.getObjectByName(n),pt=n=>bone(n).getWorldPosition(new THREE.Vector3());
 const lengths={};for(const side of ['Left','Right']){lengths[side]=[pt(side+'Shoulder').distanceTo(pt(side+'Arm')),pt(side+'Arm').distanceTo(pt(side+'ForeArm')),pt(side+'ForeArm').distanceTo(pt(side+'Hand'))]}
 const mixer=new THREE.AnimationMixer(scene);mixer.clipAction(animations[0]).play();
 let outward=0,upperOutward=0,maxStretch=0,seam=0;
 const seamGroups=[];
 scene.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;const p=mesh.geometry.attributes.position,groups=new Map();for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e6)).join(',');const group=groups.get(key)??[];group.push(i);groups.set(key,group)}seamGroups.push({mesh,groups:[...groups.values()].filter(g=>g.length>1)});});
 for(let i=0;i<60;i++){
 mixer.setTime(animations[0].duration*i/60);scene.updateMatrixWorld(true);
 const right=pt('LeftArm').sub(pt('RightArm')).normalize();
 for(const [side,sign] of [['Left',1],['Right',-1]]){
 const shoulder=pt(side+'Arm'),elbow=pt(side+'ForeArm'),hand=pt(side+'Hand');
 outward=Math.max(outward,hand.clone().sub(elbow).dot(right)*sign);
 upperOutward=Math.max(upperOutward,elbow.clone().sub(shoulder).dot(right)*sign);
 const d=[pt(side+'Shoulder').distanceTo(shoulder),shoulder.distanceTo(elbow),elbow.distanceTo(hand)];
 d.forEach((v,j)=>maxStretch=Math.max(maxStretch,Math.abs(v-lengths[side][j])));
 }
 for(const {mesh,groups}of seamGroups){mesh.skeleton.update();for(const group of groups){const first=mesh.applyBoneTransform(group[0],new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,group[0])).applyMatrix4(mesh.matrixWorld);for(const idx of group.slice(1)){const next=mesh.applyBoneTransform(idx,new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,idx)).applyMatrix4(mesh.matrixWorld);seam=Math.max(seam,first.distanceTo(next));}}}
 }
 results.push({file,outward,upperOutward,maxStretch,seam,lengths});
}

const [before,after]=results;
assert(after.outward<.012,'Forearms must not flare outward from the elbows');
assert(after.upperOutward<.025,'Upper arms should remain beside the torso');
assert(after.outward<before.outward*.15,'Reduce outward forearm flare compared with previous rig');
assert(after.maxStretch<.0001,'Joint lengths and shoulder attachment must not stretch');
assert(after.seam<.00001,'Coincident skin vertices must not split during running');
const raw=await readRig('guest-rerig-run'),final=await readRig('guest-rerig-run-retargeted');
for(const t of raw.animations[0].tracks){
 if(/(Shoulder|Arm|ForeArm|Hand)\.quaternion$/.test(t.name)||t.name==='Hips.position')continue;
 const delivered=final.animations[0].tracks.find(a=>a.name===t.name);assert.deepEqual(delivered.times,t.times);assert.deepEqual(delivered.values,t.values,'Legs and torso must retain the preset motion');
}
console.log('PASS: forearm alignment, elbows beside torso, shoulder attachment, skin seams, preserved lower-body preset',results);
