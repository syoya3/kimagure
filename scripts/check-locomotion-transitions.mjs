import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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

import { registerHooks } from 'node:module';
registerHooks({resolve(specifier, context, next){
 if(specifier.startsWith('.')&&context.parentURL?.includes('/src/game/')&&!/\.[a-z]+$/.test(specifier))return next(specifier+'.ts',context);
 return next(specifier,context);
}});
const {locomotionClips}=await import('../src/game/locomotionClips.ts');
const {scene,animations}=await readRig('guest-rerig-run-retargeted');
const original=scene.getObjectByName('LeftArm').quaternion.clone();
const clips=locomotionClips(scene,animations[0]);
assert(original.angleTo(scene.getObjectByName('LeftArm').quaternion)<1e-5,'Baking must restore source pose');
for(const track of clips.run.tracks){
 const size=track.getValueSize(),a=track.values.slice(0,size),b=track.values.slice(-size);
 if(size===4)assert(new THREE.Quaternion().fromArray(a).normalize().angleTo(new THREE.Quaternion().fromArray(b).normalize())<.002,'Quaternion seam');
 else assert(new THREE.Vector3().fromArray(a).distanceTo(new THREE.Vector3().fromArray(b))<.01,'Native position seam must be below 0.1 mm');
}
const mixer=new THREE.AnimationMixer(scene),run=mixer.clipAction(clips.run).play(),idle=mixer.clipAction(clips.idle).play();
run.time=.31; let largestStep=0;
const bones=[];scene.traverse(b=>{if(b.isBone)bones.push(b)});
let previous=null;
for(let i=0;i<=60;i++){
 const weight=1-i/60;run.setEffectiveWeight(weight);idle.setEffectiveWeight(1-weight);mixer.update(0);
 if(previous)bones.forEach((b,j)=>largestStep=Math.max(largestStep,b.quaternion.angleTo(previous[j])));
 previous=bones.map(b=>b.quaternion.clone());

}
assert(largestStep<.12,'Run-to-idle transition must not snap');
const idleQ=scene.getObjectByName('LeftArm').quaternion.clone();
mixer.update(.1);const nextQ=scene.getObjectByName('LeftArm').quaternion;assert(idleQ.toArray().every((v,i)=>Math.abs(v-nextQ.toArray()[i])<1e-6),'Idle should not alternate with the bind pose');
console.log('PASS: source restoration, loop seam, continuous stop, stable idle', {largestJointStep:largestStep});

const {zoomByWheel,MIN_CITY_ZOOM,MAX_CITY_ZOOM}=await import('../src/game/useCityZoom.ts');
assert(zoomByWheel(1,100)>1&&zoomByWheel(1,-100)<1);
assert.equal(zoomByWheel(MAX_CITY_ZOOM,240),MAX_CITY_ZOOM);
assert.equal(zoomByWheel(MIN_CITY_ZOOM,-240),MIN_CITY_ZOOM);
assert(Math.abs(zoomByWheel(zoomByWheel(1,100),-100)-1)<1e-10);
console.log('PASS: wheel zoom direction, limits and reversibility');

const {keepPlayerInFrame}=await import('../src/game/cameraFollow.ts');
for(const aspect of [390/844,1280/720])for(const zoom of [.48,1,4.8])for(const x of [-30,0,30])for(const z of [-39,0,20]) {
 const camera=new THREE.PerspectiveCamera(40,aspect,.1,450),lookAt=new THREE.Vector3(60,1.1,14),player=new THREE.Vector3(x,.12,z);
 camera.position.copy(lookAt).add(new THREE.Vector3(12.5,21,21.65).multiplyScalar(zoom));camera.lookAt(lookAt);camera.updateMatrixWorld(true);
 keepPlayerInFrame(camera,lookAt,player);const projected=player.clone().add(new THREE.Vector3(0,1.2,0)).project(camera);
 assert(Math.abs(projected.x)<=.641&&Math.abs(projected.y)<=.581,`Runner outside safe area: ${projected.toArray()}`);
}
console.log('PASS: camera follow keeps runner inside safe margins across city bounds, zoom range and portrait/landscape');
