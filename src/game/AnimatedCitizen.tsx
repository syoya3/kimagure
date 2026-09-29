"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";
import { AssetBoundary, MeshyAsset } from "./MeshyAsset";
import { locomotionClips } from "./locomotionClips";
import { relaxHands } from "./characterRun";
import { smoothCharacterGeometry, naturalCharacterMaterial } from "./characterSurface";

export type Locomotion = { speed: number };
const HEIGHT = 2.45;

function RiggedCitizen({ motion }: { motion: RefObject<Locomotion> }) {
  const { scene: source, animations } = useGLTF("/models/tech-campus/guest-rerig-run-retargeted.glb");
  const blend = useRef(0);
  const rig = useMemo(() => {
    const scene = clone(source);
    scene.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(scene);
    const scale = HEIGHT / bounds.getSize(new THREE.Vector3()).y;
    const clips = locomotionClips(scene, animations[0]);
    const mixer = new THREE.AnimationMixer(scene);
    const run = mixer.clipAction(clips.run), idle = mixer.clipAction(clips.idle);
    run.setEffectiveWeight(0); idle.setEffectiveWeight(1);
    const model = new THREE.Group(); model.add(scene); model.scale.setScalar(scale);
    scene.position.y = -bounds.min.y;
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true; object.receiveShadow = false;
        // A cached bind-pose sphere does not follow animated limbs at the
        // viewport edge. One moving character does not need frustum culling.
        object.frustumCulled = false;
        if (object instanceof THREE.SkinnedMesh) relaxHands(object);
        object.geometry = smoothCharacterGeometry(object.geometry);
        object.material = Array.isArray(object.material) ? object.material.map(naturalCharacterMaterial) : naturalCharacterMaterial(object.material);
      }
    });
    return { model, scene, scale, mixer, run, idle };
  }, [source, animations]);
  useEffect(() => { rig.run.play(); rig.idle.play(); return () => { rig.mixer.stopAllAction(); }; }, [rig]);
  useFrame((state, delta) => {
    const speed = motion.current.speed;
    const dt = Math.min(delta, 0.05);
    blend.current = THREE.MathUtils.damp(blend.current, speed > 0.03 ? 1 : 0, 12, dt);
    // The bundled clip's planted foot travels ~3.68 source m/s. Match that
    // measured stride speed to controller travel, including walls.
    rig.run.setEffectiveWeight(blend.current);
    rig.idle.setEffectiveWeight(1 - blend.current);
    rig.run.setEffectiveTimeScale(speed > .03 ? speed / (3.68 * rig.scale) : 0);
    rig.mixer.update(dt);
    if (process.env.NODE_ENV === "development") {
      state.gl.domElement.dataset.characterMotion = JSON.stringify({
        speed: Number(speed.toFixed(2)), runWeight: Number(blend.current.toFixed(2)), phase: Number(rig.run.time.toFixed(3)),
      });
    }
  });
  return <primitive object={rig.model} dispose={null} />;
}

export function AnimatedCitizen({ motion }: { motion: RefObject<Locomotion> }) {
  const fallback = <MeshyAsset url="/models/tech-campus/guest.glb" height={HEIGHT} fallback={null} />;
  return <AssetBoundary fallback={fallback}><Suspense fallback={fallback}><RiggedCitizen motion={motion} /></Suspense></AssetBoundary>;
}
