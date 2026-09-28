"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { S } from "@/lib/director/state";
import { lerp, smooth } from "@/lib/director/math";
import { CameraRig } from "./CameraRig";
import { Lights } from "./Lights";
import { PrologueBlock } from "./parts/PrologueBlock";
import { Room } from "./parts/Room";
import { Site } from "./parts/Site";
import { IndexStage } from "./parts/IndexStage";
import { bgTone, preToneMap } from "./bgTone";

function Atmosphere() {
  const scene = useThree((s) => s.scene);
  const fog = useMemo(() => new THREE.Fog("#F2F0EB", 1000, 2000), []);
  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame(() => {
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(S.bg);
      if (bgTone.compensate) preToneMap(scene.background);
    }
    fog.color.copy(scene.background instanceof THREE.Color ? scene.background : S.bg);
    const v = S.view;
    const outdoor = smooth(2.02, 2.2, v) * (1 - smooth(6.9, 7.0, v));
    const city = smooth(2.95, 3.6, v);
    fog.near = lerp(4000, lerp(38, 260, city), outdoor);
    fog.far = lerp(8000, lerp(150, 900, city), outdoor);
  });
  return null;
}

export function Scene() {
  return (
    <>
      <Atmosphere />
      <CameraRig />
      <Lights />
      <PrologueBlock />
      <Room />
      <Site />
      <IndexStage />
    </>
  );
}
