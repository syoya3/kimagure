import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return n(s.startsWith('.')&&c.parentURL?.includes('/src/game/')&&!/\.[a-z]+$/.test(s)?s+'.ts':s,c)}});
globalThis.self = globalThis;
globalThis.ProgressEvent ??= class { constructor(type, init) { Object.assign(this, {type}, init); } };
async function readRig(name) {
  const bytes = await fs.readFile(`public/models/tech-campus/${name}.glb`);
  const jsonLength = bytes.readUInt32LE(12), json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
  const binaryOffset = 20 + jsonLength + 8;
  json.buffers[0].uri = `data:application/octet-stream;base64,${bytes.subarray(binaryOffset).toString('base64')}`;
  // Headless inspection only: omit texture decoding; the GLB on disk is untouched.
  delete json.images; delete json.textures; delete json.materials;
  for (const mesh of json.meshes) for (const primitive of mesh.primitives) delete primitive.material;
  return new GLTFLoader().parseAsync(JSON.stringify(json), '');
}

const {locomotionClips}=await import('../src/game/locomotionClips.ts');
const {scene,animations}=await readRig('guest-rerig-run-retargeted');
assert.equal(animations[0].name,'Armature|RunFast|baselayer');
const clips=locomotionClips(scene,animations[0]);
assert.equal(clips.run.duration,animations[0].duration);
for(let i=0;i<clips.run.tracks.length;i++) {
 const a=clips.run.tracks[i],b=animations[0].tracks[i];
 assert.equal(a.name,b.name);assert.deepEqual(a.times,b.times);assert.deepEqual(a.values,b.values,'Delivered keyframes must remain untouched at runtime');
}
const mixer=new THREE.AnimationMixer(scene);mixer.clipAction(clips.run).play();
const pt=n=>scene.getObjectByName(n).getWorldPosition(new THREE.Vector3());
const ranges={Left:{rear:0,front:0,kneeMin:Math.PI,kneeMax:0},Right:{rear:0,front:0,kneeMin:Math.PI,kneeMax:0}};
let flight=0,minSole=Infinity;
for(let i=0;i<120;i++){
 mixer.setTime(clips.run.duration*i/120);scene.updateMatrixWorld(true);
 for(const side of ['Left','Right']){
  const shoulder=pt(side+'Arm'),elbow=pt(side+'ForeArm');
  const swing=elbow.z-shoulder.z;const r=ranges[side];r.rear=Math.min(r.rear,swing);r.front=Math.max(r.front,swing);
  const hip=pt(side+'UpLeg'),knee=pt(side+'Leg'),foot=pt(side+'Foot');
  const a=hip.sub(knee).angleTo(foot.sub(knee));r.kneeMin=Math.min(r.kneeMin,a);r.kneeMax=Math.max(r.kneeMax,a);
 }
 const sole=new THREE.Box3().setFromObject(scene,true).min.y;minSole=Math.min(minSole,sole);if(sole>.035)flight++;
}
for(const r of Object.values(ranges)){assert(r.rear<-.18,'Elbow must pass behind shoulder');assert(r.front>.1,'Elbow must swing forward');assert(r.kneeMax-r.kneeMin>1,'Knee must flex and extend');}
assert(flight>10);assert(minSole>-.015);
console.log('PASS: delivered Run Fast tracks, bilateral backward/forward arms, knee flexion, flight, floor clearance',ranges,{flight,minSole});
