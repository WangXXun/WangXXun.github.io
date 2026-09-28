"use client";

import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { S } from "@/lib/director/state";
import { INDEX_ORIGIN } from "@/lib/director/constants";
import { bus } from "@/lib/scroll/bus";
import { scrollToY } from "@/lib/scroll/driver";
import { createModelMaterial, type Variant } from "../materials/modelMaterial";
import { DatumEdge } from "./DatumEdge";

const SPECIMENS: Variant[] = ["paper", "foam", "board", "wood", "print", "glulam"];

function Specimen({ variant, x, size, phase }: { variant: Variant; x: number; size: number; phase: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 5, 0.035), []);
  const { material } = useMemo(() => createModelMaterial({ variant, patternScale: 1 }), [variant]);
  useFrame(() => {
    if (!ref.current || bus.reduced) return;
    ref.current.rotation.y = Math.sin(bus.time * 0.25 + phase) * 0.2;
  });
  return <mesh ref={ref} geometry={geometry} material={material} position={[x, size / 2, 0]} scale={size} castShadow receiveShadow />;
}

export function IndexStage() {
  const group = useRef<THREE.Group>(null);
  const hero = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 6, 0.035), []);
  const { material } = useMemo(() => createModelMaterial({ variant: "white" }), []);

  useFrame(() => {
    if (!group.current) return;
    group.current.visible = S.view >= 6.97;
    if (hero.current && !bus.reduced) {
      hero.current.rotation.y = bus.time * 0.18;
      hero.current.position.y = 0.62 + Math.sin(bus.time * 0.9) * 0.02;
    }
  });

  return (
    <group ref={group} position={INDEX_ORIGIN}>
      <group ref={hero} position={[0, 0.62, 0]}>
        <mesh
          geometry={geometry}
          material={material}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            scrollToY(0);
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "")}
        />
        <DatumEdge />
      </group>
      {SPECIMENS.map((v, i) => (
        <Specimen key={v} variant={v} x={1.25 + i * 0.78} size={0.5} phase={i * 0.9} />
      ))}
      <ContactShadows position={[2, 0.001, 0]} scale={[10, 4]} blur={2.4} opacity={0.4} far={1.4} resolution={512} color="#5a5048" />
      <mesh rotation-x={-Math.PI / 2} position={[2, -0.002, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial opacity={0.14} color="#4a4038" />
      </mesh>
    </group>
  );
}
