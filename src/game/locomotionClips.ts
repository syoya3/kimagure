import * as THREE from "three";
import { createHumanGait } from "./characterAnimation";
import { runningArms } from "./characterRun";

// Capture only neutral standing. The delivered GLB contains the offline arm retarget.
export function locomotionClips(scene: THREE.Object3D, source: THREE.AnimationClip) {
  const bones: THREE.Bone[] = [];
  scene.traverse(o => { if (o instanceof THREE.Bone) bones.push(o); });
  const originals = bones.map(b => ({ p: b.position.clone(), q: b.quaternion.clone(), s: b.scale.clone() }));
  const gait = createHumanGait(scene), arms = runningArms(scene);
  gait.update(0, 0, 0); arms(0, 0);
  const hips = scene.getObjectByName("Hips")!;
  hips.position.x = 0; hips.position.z = 0;
  const idleTracks: THREE.KeyframeTrack[] = [];
  for (const bone of bones) {
    idleTracks.push(new THREE.QuaternionKeyframeTrack(`${bone.name}.quaternion`, [0, 1], [...bone.quaternion.toArray(), ...bone.quaternion.toArray()]));
    idleTracks.push(new THREE.VectorKeyframeTrack(`${bone.name}.position`, [0, 1], [...bone.position.toArray(), ...bone.position.toArray()]));
    idleTracks.push(new THREE.VectorKeyframeTrack(`${bone.name}.scale`, [0, 1], [...bone.scale.toArray(), ...bone.scale.toArray()]));
  }
  bones.forEach((b, i) => { b.position.copy(originals[i].p); b.quaternion.copy(originals[i].q); b.scale.copy(originals[i].s); });
  scene.updateMatrixWorld(true);
  // Runtime performs no additional joint corrections; blend the delivered clip.
  return { run: source.clone(), idle: new THREE.AnimationClip("Relaxed standing", 1, idleTracks) };
}
