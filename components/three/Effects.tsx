"use client";

import { EffectComposer, N8AO, Noise, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { bgTone } from "./bgTone";
import { S } from "@/lib/director/state";

type N8AOHandle = { configuration: { intensity: number; aoRadius: number; distanceFalloff: number } };

export function Effects() {
  const ao = useRef<N8AOHandle>(null);

  useEffect(() => {
    bgTone.compensate = true;
    return () => {
      bgTone.compensate = false;
    };
  }, []);

  useFrame(() => {
    const cfg = ao.current?.configuration;
    if (!cfg) return;
    // AO radius follows the scene scale: small at the table, large at 1:1 and in the city.
    const inRoom = S.view < 2;
    const radius = inRoom ? (S.view < 1 ? 0.35 : 0.45) : S.view < 3 ? 1.6 : 6;
    cfg.aoRadius = radius;
    cfg.distanceFalloff = radius * 0.6;
    cfg.intensity = 2.2 * (1 - S.dark);
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO ref={ao as never} halfRes aoRadius={0.4} distanceFalloff={0.25} intensity={2.2} quality="medium" />
      <SMAA />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette offset={0.38} darkness={0.2} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.08} />
    </EffectComposer>
  );
}
