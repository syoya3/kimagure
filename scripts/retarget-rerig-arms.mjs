// Offline arm retargeting: preserve Meshy's Run Fast timing, elbow flexion and
// sagittal swing, remapping them into the rerigged character's joint frames.
import fs from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
globalThis.self=globalThis;globalThis.ProgressEvent??=class{constructor(t,i){Object.assign(this,{type:t},i)}};
async function read(path){const bytes=await fs.readFile(path),length=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+length));const bin=Buffer.from(bytes.subarray(28+length));const doc=structuredClone(json);doc.buffers[0].uri='data:application/octet-stream;base64,'+bin.toString('base64');delete doc.images;delete doc.textures;delete doc.materials;for(const m of doc.meshes)for(const p of m.primitives)delete p.material;return {json,bin,...await new GLTFLoader().parseAsync(JSON.stringify(doc),'')}}
const target=await read('public/models/tech-campus/guest-rerig-run.glb');
const reference=await read('public/models/tech-campus/guest-run-fast.glb');
const src=reference.scene,dst=target.scene;
const sm=new THREE.AnimationMixer(src),tm=new THREE.AnimationMixer(dst);sm.clipAction(reference.animations[0]).play();tm.clipAction(target.animations[0]).play();
const bone=(s,n)=>s.getObjectByName(n),pt=(s,n)=>bone(s,n).getWorldPosition(new THREE.Vector3());
const rest=Object.fromEntries(['LeftShoulder','RightShoulder'].map(n=>[n,bone(dst,n).quaternion.clone()]));
function axes(s){const right=pt(s,'LeftArm').sub(pt(s,'RightArm')).normalize();const up=pt(s,'neck').sub(pt(s,'Hips')).normalize();const forward=new THREE.Vector3().crossVectors(right,up).normalize();up.crossVectors(forward,right).normalize();return {right,up,forward}}
function aim(name,child,dir){dst.updateMatrixWorld(true);const b=bone(dst,name),current=pt(dst,child).sub(pt(dst,name)).normalize();const q=new THREE.Quaternion().setFromUnitVectors(current,dir.clone().normalize()).multiply(b.getWorldQuaternion(new THREE.Quaternion()));b.quaternion.copy(b.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));dst.updateMatrixWorld(true)}
const names=['Left','Right'].flatMap(s=>['Shoulder','Arm','ForeArm','Hand'].map(j=>s+j));
const values=Object.fromEntries(names.map(n=>[n,[]]));
const timeTrack=target.animations[0].tracks.find(t=>t.name==='LeftArm.quaternion');
for(const time of timeTrack.times){
 sm.setTime(time===target.animations[0].duration?0:time);tm.setTime(time===target.animations[0].duration?0:time);
 src.updateMatrixWorld(true);dst.updateMatrixWorld(true);
 for(const n of ['LeftShoulder','RightShoulder'])bone(dst,n).quaternion.copy(rest[n]);
 dst.updateMatrixWorld(true);const a=axes(src),b=axes(dst);
 for(const [side,sign]of [['Left',1],['Right',-1]]){
  const upper=pt(src,side+'ForeArm').sub(pt(src,side+'Arm')).normalize();
  const lower=pt(src,side+'Hand').sub(pt(src,side+'ForeArm')).normalize();
  const swing=Math.atan2(upper.dot(a.forward),-upper.dot(a.up));
  const flex=upper.angleTo(lower);
  const direction=(angle,lateral)=>b.up.clone().multiplyScalar(-Math.cos(angle)).addScaledVector(b.forward,Math.sin(angle)).addScaledVector(b.right,lateral);
  aim(side+'Arm',side+'ForeArm',direction(swing,sign*.055));
  aim(side+'ForeArm',side+'Hand',direction(swing+flex,-sign*.035));
  // Match the hand long axis to the forearm, with palms facing the torso.
  const y=pt(dst,side+'Hand').sub(pt(dst,side+'ForeArm')).normalize();
  const z=b.right.clone().multiplyScalar(sign).addScaledVector(y,-sign*b.right.dot(y)).normalize();
  const x=new THREE.Vector3().crossVectors(y,z).normalize();
  const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
  const hand=bone(dst,side+'Hand');hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));
 }
 for(const n of names){let q=bone(dst,n).quaternion.clone().normalize(),v=values[n];if(v.length&&q.dot(new THREE.Quaternion().fromArray(v.slice(-4)))<0)q.set(-q.x,-q.y,-q.z,-q.w);v.push(...q.toArray())}
}
const {json,bin}=target;
for(const channel of json.animations[0].channels){const name=json.nodes[channel.target.node].name;if(channel.target.path!=='rotation'||!values[name])continue;const sampler=json.animations[0].samplers[channel.sampler],acc=json.accessors[sampler.output],view=json.bufferViews[acc.bufferView],start=(view.byteOffset??0)+(acc.byteOffset??0);if(acc.count!==timeTrack.times.length)throw new Error('Unexpected keyframe layout');values[name].forEach((v,i)=>bin.writeFloatLE(v,start+i*4));delete acc.min;delete acc.max;}
// Calibrate the new rig's sole clearance: raw run dips 3.60 cm below its
// standing floor. Lift the animated pelvis uniformly, retaining its bounce.
for(const channel of json.animations[0].channels){if(json.nodes[channel.target.node].name!=='Hips'||channel.target.path!=='translation')continue;const acc=json.accessors[json.animations[0].samplers[channel.sampler].output],view=json.bufferViews[acc.bufferView],start=(view.byteOffset??0)+(acc.byteOffset??0);for(let i=0;i<acc.count;i++){const at=start+i*12+4;bin.writeFloatLE(bin.readFloatLE(at)+3.65,at)}delete acc.min;delete acc.max;}
json.asset.generator='Meshy T-pose rerig + arm joint-frame retarget';
const raw=Buffer.from(JSON.stringify(json)),j=Buffer.alloc(Math.ceil(raw.length/4)*4,0x20);raw.copy(j);const out=Buffer.alloc(28+j.length+bin.length);out.writeUInt32LE(0x46546c67,0);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(j.length,12);out.writeUInt32LE(0x4e4f534a,16);j.copy(out,20);out.writeUInt32LE(bin.length,20+j.length);out.writeUInt32LE(0x004e4942,24+j.length);bin.copy(out,28+j.length);
const path='public/models/tech-campus/guest-rerig-run-retargeted.glb';await fs.writeFile(path,out);console.log({path,frames:timeTrack.times.length,retargetedJoints:names});
