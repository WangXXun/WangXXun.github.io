"use client";

import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { S } from "@/lib/director/state";
import { PROLOGUE_LIFT } from "@/lib/director/constants";
import { smooth } from "@/lib/director/math";
import { bus } from "@/lib/scroll/bus";
import { createModelMaterial, VARIANTS } from "../materials/modelMaterial";
import { DrawLines, boxEdges } from "../lines/DrawLines";
import { DatumEdge } from "./DatumEdge";

const CYCLE = ["paper", "foam", "board", "wood", "print", "white"] as const;

export function PrologueBlock() {
  const group = useRef<THREE.Group>(null);
  const edges = useRef<THREE.LineSegments>(null);
  const shadows = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 6, 0.035), []);
  const { material, uniforms } = useMemo(() => createModelMaterial({ variant: "white" }), []);
  const segs = useMemo(() => boxEdges(1.002, 1.002, 1.002), []);
  const clickIndex = useRef(0);
  const current = useRef(0);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.visible = S.prologueBlock;
    if (shadows.current) shadows.current.visible = S.view < 0.9;
    if (!S.prologueBlock) return;

    const settle = 1 - smooth(0.15, 0.6, S.view);
    const t = bus.time;
    const float = bus.reduced ? 0 : Math.sin(t * 0.9) * 0.025 * settle;
    g.position.set(0, PROLOGUE_LIFT + 0.5 + float, 0);
    g.rotation.y = bus.reduced ? 0 : Math.sin(t * 0.22) * 0.42 * settle;
    g.rotation.x = bus.reduced ? 0 : Math.sin(t * 0.31 + 1.2) * 0.04 * settle;

    // Intro: edges draw first, then faces fill bottom → top.
    const intro = S.intro;
    const edgeP = Math.min(intro / 0.55, 1);
    const fill = smooth(0.5, 1, intro);
    const lm = edges.current?.material as THREE.ShaderMaterial | undefined;
    if (lm) {
      lm.uniforms.uProgress.value = edgeP;
      lm.uniforms.uOpacity.value = 0.9 * (1 - smooth(0.85, 1, intro));
    }
    uniforms.uCut.value = fill >= 1 ? 2 : -0.1 + fill * 1.25;
    uniforms.uTime.value = t;
  });

  const onClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (S.view > 0.3 || S.intro < 1) return;
    const next = CYCLE[clickIndex.current % CYCLE.length];
    clickIndex.current++;
    const to = VARIANTS.indexOf(next);
    uniforms.uFrom.value = current.current;
    uniforms.uTo.value = to;
    current.current = to;
    uniforms.uMix.value = 0;
    gsap.to(uniforms.uMix, { value: 1, duration: bus.reduced ? 0 : 0.9, ease: "power2.inOut" });
  };

  return (
    <>
      <group ref={group}>
        <mesh
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
          onClick={onClick}
          onPointerOver={() => (document.body.style.cursor = S.view < 0.3 ? "pointer" : "")}
          onPointerOut={() => (document.body.style.cursor = "")}
        />
        <DatumEdge />
        <DrawLines ref={edges} segs={segs} color="#1A1A1A" opacity={0.9} />
      </group>
      <group ref={shadows}>
        <ContactShadows position={[0, 0.001, 0]} scale={5} blur={2.6} opacity={0.42} far={1.6} resolution={512} color="#5a5048" />
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.002, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <shadowMaterial opacity={0.16} color="#4a4038" />
        </mesh>
      </group>
    </>
  );
}
