import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function inPlaceRun(source: THREE.AnimationClip) {
  const clip = source.clone();
  for (const track of clip.tracks) if (/Hips\.position$/.test(track.name)) {
    for (let i = 0; i < track.values.length; i += 3) { track.values[i] = 0; track.values[i + 2] = 0; }
  }
  return clip;
}

// The generated hand has splayed, fused fingers and no finger joints. Replace
// only that region with a compact relaxed grip attached to the existing wrist.
export function relaxHands(mesh: THREE.SkinnedMesh) {
  mesh.geometry = mesh.geometry.clone();
  const geometry = mesh.geometry;
  const indices = geometry.getAttribute("skinIndex"), weights = geometry.getAttribute("skinWeight");
  const handIndices = mesh.skeleton.bones.flatMap((b, i) => /^(Left|Right)Hand$/.test(b.name) ? [i] : []);
  const isHand = (vertex: number) => {
    let influence = 0;
    for (let k = 0; k < 4; k++) if (handIndices.includes(indices.getComponent(vertex, k))) influence += weights.getComponent(vertex, k);
    return influence > .45;
  };
  const source = geometry.getIndex();
  const kept: number[] = [];
  const count = source?.count ?? geometry.getAttribute("position").count;
  for (let i = 0; i < count; i += 3) {
    const a = source ? source.getX(i) : i, b = source ? source.getX(i + 1) : i + 1, c = source ? source.getX(i + 2) : i + 2;
    if (!isHand(a) && !isHand(b) && !isHand(c)) kept.push(a, b, c);
  }
  geometry.setIndex(kept);
  for (const index of handIndices) {
    const bone = mesh.skeleton.bones[index];
    const parts: THREE.BufferGeometry[] = [];
    const ellipsoid = (x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
      const part = new THREE.SphereGeometry(1, 12, 10);
      part.scale(sx, sy, sz); part.translate(x, y, z); parts.push(part);
    };
    // Meshy's skeleton uses centimetres. Rounded knuckles, folded finger pads
    // and a separate thumb preserve a recognizable hand silhouette at distance.
    ellipsoid(0, 1, 0, 2.35, 3, 1.9);
    ellipsoid(0, 4.5, 0, 3.15, 3.4, 1.85);
    for (let finger = 0; finger < 4; finger++) {
      const x = -2.25 + finger * 1.5;
      const y = 6.9 - Math.abs(finger - 1.3) * .28;
      ellipsoid(x, y, -.75, .88, 1.6, 1.5);
      ellipsoid(x, 5.25, -2.0, .8, 1.65, .92);
    }
    const sign = bone.name.startsWith("Left") ? -1 : 1;
    ellipsoid(sign * 2.7, 3.9, -1.5, 1.18, 2, 1.15);
    ellipsoid(sign * 1.9, 5, -2.65, 1.25, .88, .85);
    const handGeometry = mergeGeometries(parts)!;
    for (const part of parts) part.dispose();
    const hand = new THREE.Mesh(handGeometry, new THREE.MeshStandardMaterial({ color: "#e4bea6", roughness: .72 }));
    hand.name = bone.name + "RelaxedGrip";
    hand.castShadow = true;
    bone.add(hand);
  }
}

export function runningArms(scene: THREE.Object3D) {
  const arms = (["Left", "Right"] as const).map((side, i) => {
    const shoulder = scene.getObjectByName(side + "Shoulder")!;
    const upper = scene.getObjectByName(side + "Arm")!, elbow = scene.getObjectByName(side + "ForeArm")!, hand = scene.getObjectByName(side + "Hand")!;
    return { shoulder, upper, elbow, hand, sign: i ? -1 : 1, offset: i * Math.PI,
      rest: [shoulder, upper, elbow, hand].map(b => b.quaternion.clone()) };
  });
  const origin = new THREE.Vector3(), end = new THREE.Vector3(), target = new THREE.Vector3(), direction = new THREE.Vector3();
  const basis = new THREE.Matrix4(), across = new THREE.Vector3(), out = new THREE.Vector3();
  const rootQ = new THREE.Quaternion(), parentQ = new THREE.Quaternion(), boneQ = new THREE.Quaternion(), delta = new THREE.Quaternion();
  function aim(bone: THREE.Object3D, child: THREE.Object3D, x: number, y: number, z: number) {
    scene.updateMatrixWorld(true);
    bone.getWorldPosition(origin); child.getWorldPosition(end);
    scene.getWorldQuaternion(rootQ);
    direction.set(x, y, z).normalize().applyQuaternion(rootQ);
    delta.setFromUnitVectors(end.sub(origin).normalize(), direction);
    bone.getWorldQuaternion(boneQ); bone.parent!.getWorldQuaternion(parentQ);
    bone.quaternion.copy(parentQ.invert().multiply(delta).multiply(boneQ));
  }
  return (phase: number, weight: number) => {
    for (const arm of arms) {
      [arm.upper, arm.elbow, arm.hand].forEach((b, i) => b.quaternion.copy(arm.rest[i + 1]));
      scene.updateMatrixWorld(true);
      const opposite = arm.sign === 1 ? "Right" : "Left";
      const hip = scene.getObjectByName(opposite + "UpLeg")!, knee = scene.getObjectByName(opposite + "Leg")!;
      hip.getWorldPosition(origin); knee.getWorldPosition(end);
      scene.getWorldQuaternion(rootQ);
      direction.copy(end).sub(origin).applyQuaternion(rootQ.invert());
      const swing = THREE.MathUtils.clamp(Math.atan2(direction.z, -direction.y) * .85, -.72, .72) * weight;
      aim(arm.upper, arm.elbow, arm.sign * 0.06, -Math.cos(swing), Math.sin(swing));
      const forearm = swing + Math.cos(phase * Math.PI * 4) * .08 * weight;
      // Elbows stay near the ribs; forearms rise to a relaxed ~90 degree bend.
      aim(arm.elbow, arm.hand, arm.sign * 0.02, -1 + (1 + Math.sin(forearm)) * weight, .15 * (1 - weight) + Math.cos(forearm) * weight);
      scene.updateMatrixWorld(true);
      arm.elbow.getWorldPosition(origin); arm.hand.getWorldPosition(end);
      // Local +Y follows the fingers; -Z is the palm. Keep wrists straight
      // and palms facing the torso, instead of accumulating a guessed twist.
      target.copy(end).sub(origin).normalize();
      scene.getWorldQuaternion(rootQ);
      out.set(arm.sign, 0, 0).applyQuaternion(rootQ);
      out.addScaledVector(target, -out.dot(target)).normalize();
      across.crossVectors(target, out).normalize();
      basis.makeBasis(across, target, out);
      boneQ.setFromRotationMatrix(basis);
      arm.hand.parent!.getWorldQuaternion(parentQ);
      arm.hand.quaternion.copy(parentQ.invert().multiply(boneQ));
    }
  };
}
