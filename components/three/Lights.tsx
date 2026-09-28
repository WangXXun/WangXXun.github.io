"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { S } from "@/lib/director/state";
import { lerp, smooth } from "@/lib/director/math";
import { useTier } from "./quality";
import { INDEX_ORIGIN } from "@/lib/director/constants";

const center = new THREE.Vector3();
const dir = new THREE.Vector3();
const warm = new THREE.Color("#FFE2C2");
const noon = new THREE.Color("#FFF8EE");
const tmpCol = new THREE.Color();
const PROLOGUE_KEY = new THREE.Vector3(0.45, 0.8, 0.62).normalize();

/** Sun direction (towards the sun) for an hour of day. Sun sweeps along the −X side. */
export function sunDirection(hour: number, out: THREE.Vector3) {
  const t = THREE.MathUtils.clamp((hour - 7.5) / 10.5, 0, 1);
  const az = THREE.MathUtils.degToRad(lerp(62, -62, t));
  const el = THREE.MathUtils.degToRad(14 + 44 * Math.sin(Math.PI * t));
  return out.set(-Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)).normalize();
}

export function Lights() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const scene = useThree((s) => s.scene);
  const tier = useTier();
  const lastExtent = useRef(0);
  const mapSize = tier === "high" ? 4096 : tier === "mid" ? 2048 : 1024;

  useLayoutEffect(() => {
    const l = sun.current;
    if (!l) return;
    scene.add(l.target);
    return () => {
      scene.remove(l.target);
    };
  }, [scene]);

  useFrame(() => {
    const l = sun.current;
    const h = hemi.current;
    if (!l || !h) return;
    const v = S.view;

    // Where the shadow frustum should be, and how big.
    let extent: number;
    if (v < 1.9) {
      extent = v < 0.6 ? 1.6 : Math.max(1.6, 3.0 * (S.roomK / 1) + 0.2);
      center.set(0, v < 0.6 ? 0.8 : 1.3 * S.roomK + S.roomY, v < 0.6 ? 0 : -0.2 * S.roomK);
    } else {
      const s = S.siteS;
      extent = Math.max(3.2 * (1 - S.roomAway), 14.5 * s);
      center.copy(S.siteOrigin).addScaledVector(new THREE.Vector3(0.5, 0, 1.5), s);
      if (S.roomAway < 0.5) center.lerp(new THREE.Vector3(0, 1.3, -0.2), 1 - S.roomAway * 2);
    }
    const cityK = smooth(2.95, 3.6, v);
    if (cityK > 0) {
      extent = lerp(extent, 170, cityK);
      center.lerp(S.siteOrigin, cityK);
    }
    if (v >= 6.97) {
      extent = 4.5;
      center.copy(INDEX_ORIGIN).add(new THREE.Vector3(2, 0.4, 0));
    }

    sunDirection(S.sunHour, dir);
    // Prologue: a studio key light from front-right, easing into the real sun.
    const studio = 1 - smooth(0.45, 0.9, v);
    if (studio > 0) dir.lerp(PROLOGUE_KEY, studio).normalize();
    l.position.copy(center).addScaledVector(dir, extent * 2.5 + 10);
    l.target.position.copy(center);
    l.target.updateMatrixWorld();

    if (Math.abs(extent - lastExtent.current) > extent * 0.002) {
      const cam = l.shadow.camera;
      cam.left = -extent;
      cam.right = extent;
      cam.top = extent;
      cam.bottom = -extent;
      cam.near = 0.1;
      cam.far = extent * 6 + 20;
      cam.updateProjectionMatrix();
      l.shadow.normalBias = extent * 0.0035;
      l.shadow.bias = -0.0002;
      lastExtent.current = extent;
    }

    const dark = S.dark;
    const indoor = v >= 1 && v < 2 ? 1 - S.roomAway : 0;
    const noonK = Math.sin(Math.PI * THREE.MathUtils.clamp((S.sunHour - 7.5) / 10.5, 0, 1));
    tmpCol.copy(warm).lerp(noon, noonK);
    l.color.copy(tmpCol);
    l.intensity = lerp(lerp(2.2, 3.2, indoor), 0.25, dark);
    h.intensity = lerp(lerp(1.35, 1.05, indoor), 0.12, dark);
    scene.environmentIntensity = lerp(lerp(1.1, 0.85, indoor), 0.12, dark);
  });

  return (
    <>
      <directionalLight
        ref={sun}
        castShadow
        intensity={2.6}
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-radius={4}
      />
      <hemisphereLight ref={hemi} args={["#ffffff", "#CFCAC0", 0.8]} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={0.9} position={[-6, 2, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} color="#FFF3E6" />
        <Lightformer form="rect" intensity={0.5} position={[5, 1.5, -3]} rotation-y={-Math.PI / 2} scale={[5, 2, 1]} />
        <Lightformer form="ring" intensity={0.6} position={[2, 3, 6]} scale={2} />
      </Environment>
    </>
  );
}
