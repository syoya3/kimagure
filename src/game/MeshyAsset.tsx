"use client";

import { Component, Suspense, useEffect, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { smoothCharacterGeometry, naturalCharacterMaterial } from "./characterSurface";
import { useMobileQuality } from "./RenderQuality";

type Props = { url: string; height: number; maxWidth?: number; maxDepth?: number; natural?: boolean; fallback: ReactNode };

export class AssetBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Model({ url, height, maxWidth = Infinity, maxDepth = Infinity, natural = false }: Omit<Props, "fallback">) {
  const mobile = useMobileQuality();
  const gl = useThree(s => s.gl);
  const { scene } = useGLTF(mobile ? url.replace("/tech-campus/", "/tech-campus/mobile/") : url);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(copy);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = Math.min(height / size.y, maxWidth / size.x, maxDepth / size.z);
    const root = new THREE.Group();
    root.add(copy);
    copy.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
    root.scale.setScalar(scale);
    copy.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true; child.receiveShadow = false;
        if (natural) {
          child.geometry = smoothCharacterGeometry(child.geometry);
          child.material = Array.isArray(child.material) ? child.material.map(naturalCharacterMaterial) : naturalCharacterMaterial(child.material);
        }
      }
    });
    return root;
  }, [scene, height, maxWidth, maxDepth, natural]);
  useEffect(() => { gl.shadowMap.needsUpdate = true; }, [gl, model]);
  useEffect(() => () => {
    if (natural) model.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        for (const material of [child.material].flat()) material.dispose();
      }
    });
  }, [model, natural]);
  // Cached geometries and materials are shared by the citizen instances.
  return <primitive object={model} dispose={null} />;
}

export function MeshyAsset({ fallback, ...props }: Props) {
  return <AssetBoundary fallback={fallback}><Suspense fallback={fallback}><Model {...props} /></Suspense></AssetBoundary>;
}
