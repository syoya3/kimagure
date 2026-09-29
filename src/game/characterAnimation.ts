import * as THREE from "three";

// Distances are in the Meshy source model's metres, independent of scene scale.
// A full cycle contains two steps. Stance occupies 60%, leaving double support.
export const STRIDE = 1.1;
const STANCE = 0.6;
export function footPath(phase: number) {
  const p = ((phase % 1) + 1) % 1;
  if (p < STANCE) return { z: STRIDE * (STANCE / 2 - p), lift: 0, stance: true };
  const t = (p - STANCE) / (1 - STANCE);
  // Hermite endpoints match the backwards velocity of the planted foot.
  const h = t * t * (3 - 2 * t);
  return {
    z: -STRIDE * STANCE / 2 + STRIDE * STANCE * h - STRIDE * (1 - STANCE) * (2 * t * t * t - 3 * t * t + t),
    lift: 0.105 * Math.sin(Math.PI * t) ** 2,
    stance: false,
  };
}

export function createHumanGait(scene: THREE.Object3D) {
  scene.updateMatrixWorld(true);
  const requireBone = (name: string) => {
    const bone = scene.getObjectByName(name);
    if (!bone) throw new Error(`Missing walking joint: ${name}`);
    return bone;
  };
  const point = (bone: THREE.Object3D) => scene.worldToLocal(bone.getWorldPosition(new THREE.Vector3()));
  const rootWorld = scene.getWorldQuaternion(new THREE.Quaternion());
  const relativeRotation = (bone: THREE.Object3D) => rootWorld.clone().invert().multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
  const hips = requireBone("Hips"), hipsRest = hips.position.clone();
  const hipOrigin = point(hips);
  const rest: { bone: THREE.Object3D; rotation: THREE.Quaternion }[] = [];
  scene.traverse(bone => { if (bone instanceof THREE.Bone) rest.push({ bone, rotation: bone.quaternion.clone() }); });
  const legs = (["Left", "Right"] as const).map((side, i) => {
    const thigh = requireBone(side + "UpLeg"), shin = requireBone(side + "Leg"), foot = requireBone(side + "Foot");
    const hip = point(thigh), knee = point(shin), ankle = point(foot);
    return { thigh, shin, foot, ankle, hip, a: hip.distanceTo(knee), b: knee.distanceTo(ankle), rotation: relativeRotation(foot), offset: i * 0.5 };
  });
  const arms = (["Left", "Right"] as const).map((side, i) => ({
    upper: requireBone(side + "Arm"), elbow: requireBone(side + "ForeArm"), hand: requireBone(side + "Hand"), sign: i === 0 ? 1 : -1, offset: i * 0.5,
  }));
  const origin = new THREE.Vector3(), endpoint = new THREE.Vector3(), desired = new THREE.Vector3();
  const parentQ = new THREE.Quaternion(), boneQ = new THREE.Quaternion(), deltaQ = new THREE.Quaternion();
  const axis = new THREE.Vector3(1, 0, 0);
  const hip = new THREE.Vector3(), ankle = new THREE.Vector3(), knee = new THREE.Vector3(), along = new THREE.Vector3(), pole = new THREE.Vector3();
  const target = new THREE.Vector3();
  // Aim in scene space, then convert back into each bone's parent frame. This
  // avoids adding bind-pose offsets to animated rotations on incompatible axes.
  function aim(bone: THREE.Object3D, child: THREE.Object3D, destination: THREE.Vector3) {
    scene.updateMatrixWorld(true);
    bone.getWorldPosition(origin); child.getWorldPosition(endpoint);
    desired.copy(destination); scene.localToWorld(desired);
    deltaQ.setFromUnitVectors(endpoint.sub(origin).normalize(), desired.sub(origin).normalize());
    bone.getWorldQuaternion(boneQ); bone.parent!.getWorldQuaternion(parentQ);
    bone.quaternion.copy(parentQ.invert().multiply(deltaQ).multiply(boneQ));
  }
  function setSceneRotation(bone: THREE.Object3D, rotation: THREE.Quaternion) {
    scene.getWorldQuaternion(boneQ); bone.parent!.getWorldQuaternion(parentQ);
    bone.quaternion.copy(parentQ.invert().multiply(boneQ).multiply(rotation));
  }
  const footQ = new THREE.Quaternion();
  return {
    update(phase: number, weight: number, time: number) {
      for (const { bone, rotation } of rest) bone.quaternion.copy(rotation);
      hips.position.copy(hipsRest);
      const paths = legs.map(leg => footPath(phase + leg.offset));
      // Raise the pelvis over the supporting leg and lower it at heel strike.
      // The height follows the leg's reach, instead of moving the whole model
      // up and down to whichever toe happens to be lowest.
      let pelvisY = hipOrigin.y;
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i], path = paths[i];
        if (!path.stance) continue;
        const reach = (leg.a + leg.b) * 0.985;
        const z = leg.ankle.z + path.z - leg.hip.z;
        pelvisY = Math.min(pelvisY, leg.ankle.y + Math.sqrt(Math.max(0, reach * reach - z * z)) + hipOrigin.y - leg.hip.y);
      }
      target.copy(hipOrigin);
      target.y += (pelvisY - hipOrigin.y) * weight;
      target.x += Math.sin(phase * Math.PI * 2) * 0.012 * weight;
      scene.localToWorld(target); hips.parent!.worldToLocal(target); hips.position.copy(target);
      scene.updateMatrixWorld(true);
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i], path = paths[i];
        hip.copy(point(leg.thigh)); ankle.copy(leg.ankle);
        ankle.z += path.z * weight; ankle.y += path.lift * weight;
        along.copy(ankle).sub(hip);
        const distance = Math.min(along.length(), leg.a + leg.b - 0.0001);
        along.normalize();
        const mid = (leg.a * leg.a - leg.b * leg.b + distance * distance) / (2 * distance);
        const bend = Math.sqrt(Math.max(0, leg.a * leg.a - mid * mid));
        pole.set(0, 0, 1).addScaledVector(along, -along.z).normalize();
        knee.copy(hip).addScaledVector(along, mid).addScaledVector(pole, bend);
        aim(leg.thigh, leg.shin, knee); aim(leg.shin, leg.foot, ankle);
        // A small toe lift on the swing; planted soles retain their bind angle.
        footQ.setFromAxisAngle(axis, -path.lift * 1.4 * weight).multiply(leg.rotation);
        setSceneRotation(leg.foot, footQ);
      }
      for (const arm of arms) {
        const swing = -Math.cos((phase + arm.offset) * Math.PI * 2) * 0.3 * weight;
        target.copy(point(arm.upper)).add(new THREE.Vector3(arm.sign * 0.1, -1, swing));
        aim(arm.upper, arm.elbow, target);
        target.copy(point(arm.elbow)).add(new THREE.Vector3(arm.sign * 0.035, -1, swing + 0.2));
        aim(arm.elbow, arm.hand, target);
        // The generated character has palms facing up. Untwist each wrist so
        // the open hands face the thighs while the arms swing past the body.
        scene.updateMatrixWorld(true);
        arm.elbow.getWorldPosition(origin); arm.hand.getWorldPosition(endpoint);
        deltaQ.setFromAxisAngle(endpoint.sub(origin).normalize(), arm.sign * 1.2);
        arm.hand.getWorldQuaternion(boneQ); arm.hand.parent!.getWorldQuaternion(parentQ);
        arm.hand.quaternion.copy(parentQ.invert().multiply(deltaQ).multiply(boneQ));
      }
      // Keep the head steady; a very small chest breath remains when standing.
      const chest = scene.getObjectByName("Spine");
      if (chest) chest.rotateX(Math.sin(time * 1.8) * 0.006 * (1 - weight));
      scene.updateMatrixWorld(true);
    },
  };
}
