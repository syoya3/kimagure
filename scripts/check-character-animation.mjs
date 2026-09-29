import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createHumanGait, footPath, STRIDE } from '../src/game/characterAnimation.ts';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

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
const { scene } = await readRig('guest-walk');
const gait = createHumanGait(scene);
const point = name => scene.getObjectByName(name).getWorldPosition(new THREE.Vector3());
const restAnkle = point('LeftFoot');
let worstPlant = 0, worstSlip = 0, maxKnee = 0, minKnee = Infinity, minSole = Infinity, maxSole = -Infinity;
for (let i = 0; i <= 120; i++) {
 const phase = i / 120;
 gait.update(phase, 1, phase);
 for (const [side, offset] of [['Left',0],['Right',.5]]) {
  const path = footPath(phase+offset), hip=point(side+'UpLeg'), knee=point(side+'Leg'), foot=point(side+'Foot');
  if(path.stance) worstPlant=Math.max(worstPlant,Math.abs(foot.y - restAnkle.y));
  const angle=Math.PI-knee.clone().sub(hip).negate().angleTo(foot.clone().sub(knee));
  maxKnee=Math.max(maxKnee,angle);minKnee=Math.min(minKnee,angle);
  assert(knee.z > (hip.z+foot.z)/2 - .035,'Knee must bend forward, never backwards');
  assert(point(side+'Hand').y < point(side+'Arm').y-.32,'Hands must hang below the shoulders');
 }
 if(i % 5 === 0) { const sole = new THREE.Box3().setFromObject(scene,true).min.y; minSole=Math.min(minSole,sole); maxSole=Math.max(maxSole,sole); }
 const phaseNext=phase+1e-4;
 if(footPath(phase).stance && footPath(phaseNext).stance) {
  const planted=point('LeftFoot'); gait.update(phaseNext,1,phaseNext);
  const displacement=point('LeftFoot').z-planted.z+STRIDE*1e-4;
  worstSlip=Math.max(worstSlip,Math.abs(displacement));
 }
}
console.log({worstPlant,worstSlip,minKnee,maxKnee,minSole,maxSole});
assert(maxSole-minSole<.035,"Skin soles should remain close to the same ground plane");
assert(worstPlant < .01,'Stance ankle must remain at pavement height');
assert(worstSlip < .0005,'Planted foot must counteract forward travel');
assert(maxKnee > .6 && maxKnee < 1.9,'Swing knee should flex naturally');
gait.update(.2,0,0);
assert(point('LeftFoot').distanceTo(restAnkle)<.005,'Stop must return feet to standing pose');
// Character rotation, placement and scale must not change the local gait.
const before=scene.worldToLocal(point('LeftFoot'));
const parent=new THREE.Group(); parent.add(scene); parent.position.set(7,.12,-3);parent.rotation.y=1.3;parent.scale.setScalar(1.4);parent.updateMatrixWorld(true);
gait.update(.2,0,0);
assert(scene.worldToLocal(point('LeftFoot')).distanceTo(before)<1e-5);
console.log('PASS: planted foot, no stance sliding, knee direction, relaxed arms, stop and rotated/scaled rig');
