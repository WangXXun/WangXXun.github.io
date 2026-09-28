"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { S } from "@/lib/director/state";
import { HERO_POS, HERO_SIZE, ROOM, SHEET, SITE_ORIGIN_0, SITE_SCALE_0, TABLE, WINDOW } from "@/lib/director/constants";
import { smooth } from "@/lib/director/math";
import { bus } from "@/lib/scroll/bus";
import { createModelMaterial } from "../materials/modelMaterial";
import { DrawLines, boxEdges, type Seg } from "../lines/DrawLines";
import { CANOPY, buildMembers } from "../canopy/field";
import { drawingSegments } from "./drawing";
import { DatumEdge } from "./DatumEdge";

const T = 0.08; // wall thickness at 1:1 room scale
const HALF = ROOM / 2;

function Panel({ size, position, material }: { size: [number, number, number]; position: [number, number, number]; material: THREE.Material }) {
  return (
    <mesh position={position} material={material} castShadow receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

function useWallMaterial() {
  return useMemo(() => createModelMaterial({ variant: "white", patternSpace: "world" }).material, []);
}

function Shell() {
  const wall = useWallMaterial();
  const front = useRef<THREE.Group>(null);
  const back = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const top = useRef<THREE.Group>(null);
  const topA = useRef<THREE.Mesh>(null);
  const topB = useRef<THREE.Mesh>(null);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2A2A2A", roughness: 0.55, metalness: 0.2 }), []);

  useFrame(() => {
    const fall = smooth(0, 0.6, S.roomAway) * (Math.PI / 2) * 0.98;
    if (front.current) front.current.rotation.x = Math.max(S.flapFront, fall);
    if (back.current) back.current.rotation.x = -fall;
    if (left.current) left.current.rotation.z = fall;
    if (right.current) right.current.rotation.z = -fall;
    if (top.current) top.current.rotation.x = -Math.max(S.flapTop, smooth(0, 0.35, S.roomAway) * 2.6);
  });

  const inner = ROOM - 2 * T;
  const wz0 = WINDOW.z0;
  const wz1 = WINDOW.z1;
  const wy0 = WINDOW.y0;
  const wy1 = WINDOW.y1;
  const sideZ0 = -HALF + T;
  const sideZ1 = HALF - T;

  return (
    <group>
      {/* floor */}
      <Panel size={[ROOM, T, ROOM]} position={[0, -T / 2, 0]} material={wall} />
      {/* back */}
      <group ref={back} position={[0, 0, -HALF]}>
        <Panel size={[ROOM, ROOM, T]} position={[0, HALF, T / 2]} material={wall} />
      </group>
      {/* front (flap) */}
      <group ref={front} position={[0, 0, HALF]}>
        <Panel size={[ROOM, ROOM, T]} position={[0, HALF, -T / 2]} material={wall} />
      </group>
      {/* right */}
      <group ref={right} position={[HALF, 0, 0]}>
        <Panel size={[T, ROOM, inner]} position={[-T / 2, HALF, 0]} material={wall} />
      </group>
      {/* left, with window */}
      <group ref={left} position={[-HALF, 0, 0]}>
        <Panel size={[T, wy0, inner]} position={[T / 2, wy0 / 2, 0]} material={wall} />
        <Panel size={[T, ROOM - wy1, inner]} position={[T / 2, (ROOM + wy1) / 2, 0]} material={wall} />
        <Panel size={[T, wy1 - wy0, wz0 - sideZ0]} position={[T / 2, (wy0 + wy1) / 2, (sideZ0 + wz0) / 2]} material={wall} />
        <Panel size={[T, wy1 - wy0, sideZ1 - wz1]} position={[T / 2, (wy0 + wy1) / 2, (sideZ1 + wz1) / 2]} material={wall} />
        {/* slim window frame + one mullion */}
        <mesh position={[T * 0.5, wy0 + 0.012, (wz0 + wz1) / 2]} material={frameMat} castShadow>
          <boxGeometry args={[0.05, 0.024, wz1 - wz0]} />
        </mesh>
        <mesh position={[T * 0.5, wy1 - 0.012, (wz0 + wz1) / 2]} material={frameMat} castShadow>
          <boxGeometry args={[0.05, 0.024, wz1 - wz0]} />
        </mesh>
        <mesh position={[T * 0.5, (wy0 + wy1) / 2, wz0 + 0.012]} material={frameMat} castShadow>
          <boxGeometry args={[0.05, wy1 - wy0, 0.024]} />
        </mesh>
        <mesh position={[T * 0.5, (wy0 + wy1) / 2, wz1 - 0.012]} material={frameMat} castShadow>
          <boxGeometry args={[0.05, wy1 - wy0, 0.024]} />
        </mesh>
        <mesh position={[T * 0.5, (wy0 + wy1) / 2, (wz0 + wz1) / 2]} material={frameMat} castShadow>
          <boxGeometry args={[0.04, wy1 - wy0, 0.018]} />
        </mesh>
      </group>
      {/* top (flap), split in two halves */}
      <group ref={top} position={[0, ROOM, -HALF]}>
        <mesh ref={topA} position={[0, -T / 2, HALF]} material={wall} castShadow receiveShadow>
          <boxGeometry args={[ROOM, T, ROOM]} />
        </mesh>
        <mesh ref={topB} visible={false} />
      </group>
      {/* datum edge on the exterior front-right corner */}
      <group position={[HALF, HALF, HALF]} scale={[ROOM, ROOM, ROOM]}>
        <group position={[-0.5, 0, -0.5]}>
          <DatumEdge radius={0.0} thickness={0.012} />
        </group>
      </group>
    </group>
  );
}

function Table() {
  const top = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#EEEBE4", roughness: 0.6, clearcoat: 0.2, clearcoatRoughness: 0.5 }), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1E1E1E", roughness: 0.45, metalness: 0.6 }), []);
  const legH = TABLE.top - TABLE.thick;
  const legs: [number, number][] = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) legs.push([TABLE.x + sx * (TABLE.w / 2 - 0.16), TABLE.z + sz * (TABLE.d / 2 - 0.08)]);
  return (
    <group>
      <mesh position={[TABLE.x, TABLE.top - TABLE.thick / 2, TABLE.z]} material={top} castShadow receiveShadow>
        <boxGeometry args={[TABLE.w, TABLE.thick, TABLE.d]} />
      </mesh>
      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, legH / 2, z]} material={steel} castShadow>
          <boxGeometry args={[0.025, legH, 0.025]} />
        </mesh>
      ))}
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[TABLE.x + sx * (TABLE.w / 2 - 0.16), legH - 0.03, TABLE.z]} material={steel} castShadow>
          <boxGeometry args={[0.025, 0.025, TABLE.d - 0.16]} />
        </mesh>
      ))}
    </group>
  );
}

function Sheet() {
  const ink = useRef<THREE.LineSegments>(null);
  const accent = useRef<THREE.LineSegments>(null);
  const { ink: inkSegs, accent: accentSegs } = useMemo(() => drawingSegments(SHEET.w, SHEET.d), []);
  const paper = useMemo(() => new THREE.MeshStandardMaterial({ color: "#FBFAF6", roughness: 0.95 }), []);

  useFrame(() => {
    const p = S.drawing;
    const mi = ink.current?.material as THREE.ShaderMaterial | undefined;
    const ma = accent.current?.material as THREE.ShaderMaterial | undefined;
    if (mi) mi.uniforms.uProgress.value = Math.min(p * 1.1, 1);
    if (ma) ma.uniforms.uProgress.value = smooth(0.7, 1, p);
  });

  return (
    <group position={[SHEET.x, TABLE.top, SHEET.z]} rotation-y={SHEET.rot}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0008, 0]} material={paper} receiveShadow>
        <planeGeometry args={[SHEET.w, SHEET.d]} />
      </mesh>
      <DrawLines ref={ink} segs={inkSegs} color="#1A1A1A" opacity={0.82} position={[0, 0.0016, 0]} />
      <DrawLines ref={accent} segs={accentSegs} color="#FF4F1A" opacity={0.95} position={[0, 0.0018, 0]} />
    </group>
  );
}

/** Parametric net: from the hero's top face to the canopy soffit at 1:50. */
function netSegments(): { a: Seg[]; b: Seg[] } {
  const members = buildMembers();
  const nz = Math.floor(CANOPY.depth / CANOPY.member);
  const nx = members.length / nz;
  const a: Seg[] = [];
  const b: Seg[] = [];
  const topY = HERO_POS.y + HERO_SIZE / 2 + 0.0015;
  const onBlock = (x: number, z: number): [number, number, number] => [
    HERO_POS.x + (x / (CANOPY.width / 2)) * (HERO_SIZE / 2) * 0.98,
    topY,
    HERO_POS.z + (z / (CANOPY.depth / 2)) * (HERO_SIZE / 2) * 0.98,
  ];
  const onCanopy = (i: number, j: number): [number, number, number] => {
    const m = members[i * nz + j];
    return [
      SITE_ORIGIN_0.x + m.x * SITE_SCALE_0,
      SITE_ORIGIN_0.y + (CANOPY.top - m.depth) * SITE_SCALE_0,
      SITE_ORIGIN_0.z + m.z * SITE_SCALE_0,
    ];
  };
  const push = (i0: number, j0: number, i1: number, j1: number) => {
    const m0 = members[i0 * nz + j0];
    const m1 = members[i1 * nz + j1];
    a.push([...onBlock(m0.x, m0.z), ...onBlock(m1.x, m1.z)] as Seg);
    b.push([...onCanopy(i0, j0), ...onCanopy(i1, j1)] as Seg);
  };
  for (let i = 0; i < nx; i += 3) for (let j = 0; j < nz - 1; j++) push(i, j, i, j + 1);
  for (let j = 0; j < nz; j += 2) for (let i = 0; i < nx - 3; i += 3) push(i, j, i + 3, j);
  return { a, b };
}

function Hero() {
  const mesh = useRef<THREE.Mesh>(null);
  const datum = useRef<THREE.Group>(null);
  const wire = useRef<THREE.LineSegments>(null);
  const net = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 6, 0.035), []);
  const { material, uniforms } = useMemo(() => createModelMaterial({ variant: "white" }), []);
  const wireSegs = useMemo(() => boxEdges(1.004, 1.004, 1.004), []);
  const { a: netA, b: netB } = useMemo(() => netSegments(), []);

  useFrame(() => {
    const visible = S.view > 0.7 && S.view < 2.12;
    if (mesh.current) {
      mesh.current.visible = visible && S.heroCut > -0.1;
      mesh.current.castShadow = S.heroCut > 1;
    }
    if (datum.current) datum.current.visible = visible && S.heroCut > 0.9;
    uniforms.uFrom.value = S.vFrom;
    uniforms.uTo.value = S.vTo;
    uniforms.uMix.value = S.vMix;
    uniforms.uCut.value = S.heroCut > 1.1 ? 2 : S.heroCut;
    uniforms.uTime.value = bus.time;

    const wm = wire.current?.material as THREE.ShaderMaterial | undefined;
    if (wire.current && wm) {
      wire.current.visible = S.wire > 0 && S.wireFade < 1;
      wm.uniforms.uProgress.value = S.wire;
      wm.uniforms.uOpacity.value = 0.85 * (1 - S.wireFade);
    }
    const nm = net.current?.material as THREE.ShaderMaterial | undefined;
    if (net.current && nm) {
      net.current.visible = S.net > 0 && S.netFade < 1;
      nm.uniforms.uProgress.value = S.net;
      nm.uniforms.uMorph.value = S.netMorph;
      nm.uniforms.uOpacity.value = 0.9 * (1 - S.netFade) * (1 - 0.55 * S.canopyGrow);
    }
  });

  return (
    <>
      <group position={HERO_POS} scale={HERO_SIZE}>
        <mesh ref={mesh} geometry={geometry} material={material} castShadow receiveShadow />
        <group ref={datum}>
          <DatumEdge />
        </group>
        <DrawLines ref={wire} segs={wireSegs} color="#1A1A1A" />
      </group>
      <DrawLines ref={net} segs={netA} morphTo={netB} color="#FF4F1A" />
    </>
  );
}

/** Studio room. Everything here is in "room space" and scales with the unfold. */
export function Room() {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.visible = S.view > 0.55 && S.roomAway < 1;
    g.scale.setScalar(S.roomK);
    const sink = smooth(0.35, 1, S.roomAway);
    // Parked far below when hidden, so no depth/shadow pass can pick it up.
    g.position.set(0, g.visible ? S.roomY - sink * sink * 9 : -500, 0);
  });

  return (
    <group ref={group} name="room">
      <Shell />
      <Table />
      <Sheet />
      <Hero />
    </group>
  );
}
