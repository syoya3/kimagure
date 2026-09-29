import fs from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const input='public/models/tech-campus/guest-run-fast.glb';
const output='public/models/tech-campus/guest-tpose-source.glb';
const bytes=await fs.readFile(input),length=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+length));
const bin=Buffer.from(bytes.subarray(28+length));
const headless=structuredClone(json);headless.buffers[0].uri='data:application/octet-stream;base64,'+bin.toString('base64');delete headless.images;delete headless.textures;delete headless.materials;
for(const m of headless.meshes)for(const p of m.primitives)delete p.material;
globalThis.self=globalThis;globalThis.ProgressEvent??=class{constructor(t,i){Object.assign(this,{type:t},i)}};
const {scene,parser}=await new GLTFLoader().parseAsync(JSON.stringify(headless),'');scene.updateMatrixWorld(true);
const pt=n=>scene.getObjectByName(n).getWorldPosition(new THREE.Vector3());
console.log('Original arm joints', ['LeftShoulder','LeftArm','LeftForeArm','LeftHand'].map(n=>[n,...pt(n).toArray()]));
function aim(name,child,direction){
 scene.updateMatrixWorld(true);const b=scene.getObjectByName(name),c=scene.getObjectByName(child);
 const old=c.getWorldPosition(new THREE.Vector3()).sub(b.getWorldPosition(new THREE.Vector3())).normalize();
 const delta=new THREE.Quaternion().setFromUnitVectors(old,direction.clone().normalize());
 b.quaternion.copy(b.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(delta).multiply(b.getWorldQuaternion(new THREE.Quaternion())));
 scene.updateMatrixWorld(true);
}
for(const [side,sign]of [['Left',1],['Right',-1]]){
 aim(side+'Arm',side+'ForeArm',new THREE.Vector3(sign,0,0));
 aim(side+'ForeArm',side+'Hand',new THREE.Vector3(sign,0,0));
 // Hands have no finger bones. Preserve their shape while aligning the long
 // local axis with the straight arm, with the palm pointing downward.
 const hand=scene.getObjectByName(side+'Hand');
 const y=new THREE.Vector3(sign,0,0),z=new THREE.Vector3(0,1,0),x=new THREE.Vector3().crossVectors(y,z);
 const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
 hand.quaternion.copy(hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(q));
}
scene.updateMatrixWorld(true);
const newNodes=[];
let faces=0;
function writeVec(accessorId,values){
 const accessor=json.accessors[accessorId],view=json.bufferViews[accessor.bufferView];
 const start=(view.byteOffset??0)+(accessor.byteOffset??0),stride=view.byteStride??12;
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<accessor.count;i++)for(let j=0;j<3;j++){const v=values[i*3+j];bin.writeFloatLE(v,start+i*stride+j*4);min[j]=Math.min(min[j],v);max[j]=Math.max(max[j],v)}
 accessor.min=min;accessor.max=max;
}
scene.traverse(m=>{
 if(!m.isSkinnedMesh)return;m.skeleton.update();
 const association=parser.associations.get(m),primitive=json.meshes[association.meshes].primitives[association.primitives??0];
 const p=m.geometry.attributes.position,v=new THREE.Vector3(),vertices=[];
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);m.applyBoneTransform(i,v);v.applyMatrix4(m.matrixWorld);vertices.push(...v.toArray())}
 writeVec(primitive.attributes.POSITION,vertices);
 const g=m.geometry.clone();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();writeVec(primitive.attributes.NORMAL,g.attributes.normal.array);
 delete primitive.attributes.JOINTS_0;delete primitive.attributes.WEIGHTS_0;
 faces+=(m.geometry.index?.count??p.count)/3;
 newNodes.push({mesh:association.meshes,name:'Prepared_T_Pose'});
});
json.nodes=newNodes;json.scenes=[{nodes:newNodes.map((_,i)=>i)}];json.scene=0;delete json.skins;delete json.animations;
json.asset.generator='Kimagure T-pose preparation for Meshy rerigging';
json.buffers=[{byteLength:bin.length}];
const encoded=Buffer.from(JSON.stringify(json)),padded=Buffer.alloc(Math.ceil(encoded.length/4)*4,0x20);encoded.copy(padded);
const result=Buffer.alloc(28+padded.length+bin.length);result.writeUInt32LE(0x46546c67,0);result.writeUInt32LE(2,4);result.writeUInt32LE(result.length,8);result.writeUInt32LE(padded.length,12);result.writeUInt32LE(0x4e4f534a,16);padded.copy(result,20);result.writeUInt32LE(bin.length,20+padded.length);result.writeUInt32LE(0x004e4942,24+padded.length);bin.copy(result,28+padded.length);
await fs.writeFile(output,result);console.log({output,faces,bytes:result.length});
