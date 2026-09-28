"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { S, GAP_COUNT } from "@/lib/director/state";
import { ARM_BASE, BENCH, HUMAN } from "@/lib/director/constants";
import { clamp, easeInOutCubic, invLerp, lerp, smooth } from "@/lib/director/math";
import { createModelMaterial } from "../materials/modelMaterial";
import { CANOPY, buildMembers, gapMembers, type Member } from "../canopy/field";
import { RobotArm, type RobotArmHandle } from "./RobotArm";
import { useTier } from "../quality";
import { COLORS } from "@/lib/story";

const dummy = new THREE.Object3D();
const hidden = new THREE.Matrix4().makeScale(0, 0, 0);

function memberMatrix(m: Member, grow: number, out: THREE.Matrix4) {
  const h = m.depth * grow;
  dummy.position.set(m.x, CANOPY.top - h / 2, m.z);
  dummy.rotation.set(0, 0, m.tilt);
  dummy.scale.set(CANOPY.thickness, Math.max(h, 1e-4), CANOPY.member * 0.985);
  dummy.updateMatrix();
  return out.copy(dummy.matrix);
}

function Canopy({ members, gaps, material }: { members: Member[]; gaps: number[]; material: THREE.Material }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const last = useRef({ grow: -1, filled: -1 });
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const gapSet = useMemo(() => new Map(gaps.map((g, k) => [g, k])), [gaps]);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useFrame(() => {
    const im = mesh.current;
    if (!im) return;
    const grow = S.canopyGrow;
    const filled = Math.floor(S.gapsFilled + 0.02);
    if (grow === last.current.grow && filled === last.current.filled) return;
    last.current = { grow, filled };
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      const g = clamp((grow * 1.4 - m.order) / 0.4);
      const k = gapSet.get(i);
      if (g <= 0 || (k !== undefined && k >= filled)) {
        im.setMatrixAt(i, hidden);
      } else {
        im.setMatrixAt(i, memberMatrix(m, easeInOutCubic(g), m4));
      }
    }
    im.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, members.length]} castShadow receiveShadow frustumCulled={false} />;
}

function Structure() {
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8A8C8F", roughness: 0.5, metalness: 0.15 }), []);
  const cols: [number, number][] = [];
  for (const x of [-7.5, 0, 7.5]) for (const z of [-5, 5]) cols.push([x, z]);
  return (
    <group>
      {cols.map(([x, z], i) => (
        <mesh key={i} position={[x, (CANOPY.top + 0.2) / 2, z]} material={steel} castShadow receiveShadow>
          <cylinderGeometry args={[0.09, 0.1, CANOPY.top + 0.2, 20]} />
        </mesh>
      ))}
      {[-5, 5].map((z) => (
        <mesh key={z} position={[0, CANOPY.top + 0.14, z]} material={steel} castShadow>
          <boxGeometry args={[CANOPY.width + 0.2, 0.2, 0.12]} />
        </mesh>
      ))}
      {[-7.5, 0, 7.5].map((x) => (
        <mesh key={x} position={[x, CANOPY.top + 0.06, 0]} material={steel} castShadow>
          <boxGeometry args={[0.1, 0.1, CANOPY.depth]} />
        </mesh>
      ))}
    </group>
  );
}

function Human() {
  const geometry = useMemo(() => {
    const half: [number, number][] = [
      [0, 1.75], [0.065, 1.735], [0.095, 1.67], [0.095, 1.585], [0.07, 1.515], [0.05, 1.48], [0.06, 1.445],
      [0.19, 1.405], [0.225, 1.31], [0.245, 1.07], [0.26, 0.83], [0.225, 0.81], [0.2, 1.02], [0.18, 1.2],
      [0.17, 0.95], [0.16, 0.5], [0.15, 0.06], [0.18, 0.0], [0.045, 0.0], [0.05, 0.45], [0.02, 0.88], [0, 0.9],
    ];
    const shape = new THREE.Shape();
    half.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
    for (let i = half.length - 2; i > 0; i--) shape.lineTo(-half[i][0], half[i][1]);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.035, bevelEnabled: false });
    g.translate(0, 0, -0.0175);
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#FAFAF7", roughness: 0.9 }), []);
  return <mesh geometry={geometry} material={mat} position={HUMAN} rotation-y={0.55} castShadow receiveShadow />;
}

function Bench() {
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2B2C2E", roughness: 0.5, metalness: 0.5 }), []);
  const top = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3A3B3E", roughness: 0.6, metalness: 0.3 }), []);
  return (
    <group position={[BENCH.x, 0, BENCH.z]}>
      <mesh position={[0, BENCH.y - 0.03, 0]} material={top} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.06, 1.1]} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * 0.66, (BENCH.y - 0.06) / 2, sz * 0.46]} material={steel} castShadow>
            <boxGeometry args={[0.06, BENCH.y - 0.06, 0.06]} />
          </mesh>
        )),
      )}
    </group>
  );
}

const benchPos = new THREE.Vector3();
const slotPos = new THREE.Vector3();
const ctrl = new THREE.Vector3();
const toolTarget = new THREE.Vector3();
const p = new THREE.Vector3();

function Fabrication({ members, gaps, material }: { members: Member[]; gaps: number[]; material: THREE.Material }) {
  const arm = useRef<RobotArmHandle>(null);
  const piece = useRef<THREE.Mesh>(null);
  const dust = useRef<THREE.Mesh>(null);
  const root = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useFrame(() => {
    const r = root.current;
    if (!r) return;
    const show = S.robot;
    r.visible = show > 0.001 && S.view < 3.2;
    if (!r.visible) return;
    r.scale.set(1, lerp(0.001, 1, easeInOutCubic(show)), 1);

    const k = S.cycle;
    const ph = S.cyclePhase;
    const m = members[gaps[Math.min(k, gaps.length - 1)]];
    const done = S.gapsFilled >= GAP_COUNT;

    // Member lying on the bench: depth along X, thickness up.
    benchPos.set(BENCH.x, BENCH.y + CANOPY.thickness / 2, BENCH.z);
    slotPos.set(m.x, CANOPY.top - m.depth / 2, m.z);

    const machining = invLerp(0.08, 0.55, ph);
    const lift = easeInOutCubic(invLerp(0.62, 0.95, ph));

    // Tool path: along the member's long edge, with a small oscillation (illustrative milling).
    if (ph < 0.08 || done) {
      toolTarget.set(BENCH.x - 0.2, BENCH.y + 0.7, BENCH.z + 0.3);
    } else if (ph < 0.58) {
      const zz = lerp(-0.36, 0.36, machining);
      const xx = m.depth / 2 - 0.02 + Math.sin(machining * Math.PI * 6) * 0.03 - (m.depth / 2) * Math.sin(machining * Math.PI) * 0.35;
      toolTarget.set(BENCH.x + xx, BENCH.y + CANOPY.thickness + 0.005, BENCH.z + zz);
    } else {
      const up = smooth(0.55, 0.66, ph);
      toolTarget.set(lerp(BENCH.x + 0.3, BENCH.x - 0.3, up), BENCH.y + lerp(0.1, 0.8, up), BENCH.z + lerp(0.36, 0.2, up));
    }
    if (ph < 0.08 && !done) {
      const approach = smooth(0, 0.08, ph);
      toolTarget.lerp(p.set(BENCH.x + m.depth / 2 - 0.02, BENCH.y + CANOPY.thickness + 0.005, BENCH.z - 0.36), approach);
    }
    arm.current?.reach(toolTarget, ARM_BASE);

    const pc = piece.current;
    if (pc) {
      pc.visible = !done;
      ctrl.copy(benchPos).lerp(slotPos, 0.5);
      ctrl.y = Math.max(benchPos.y, slotPos.y) + 1.2;
      // Quadratic Bézier from bench to slot.
      const t = lift;
      p.copy(benchPos).multiplyScalar((1 - t) * (1 - t)).addScaledVector(ctrl, 2 * (1 - t) * t).addScaledVector(slotPos, t * t);
      pc.position.copy(p);
      pc.rotation.set(0, lerp(0.35, 0, t), lerp(Math.PI / 2, m.tilt, t));
      const appear = smooth(0, 0.06, ph);
      pc.scale.set(CANOPY.thickness * appear, m.depth * appear, CANOPY.member * 0.985 * appear);
    }
    const du = dust.current;
    if (du) {
      const on = ph > 0.1 && ph < 0.55 && !done;
      du.visible = on;
      if (on) {
        du.position.set(toolTarget.x, toolTarget.y + 0.01, toolTarget.z);
        du.scale.setScalar(0.03 + 0.012 * Math.sin(ph * 400));
      }
    }
  });

  return (
    <group ref={root}>
      <group position={ARM_BASE}>
        <RobotArm ref={arm} />
      </group>
      <Bench />
      <Human />
      <mesh ref={piece} geometry={geometry} material={material} castShadow receiveShadow />
      <mesh ref={dust}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={COLORS.orange} transparent opacity={0.6} toneMapped={false} />
      </mesh>
    </group>
  );
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function City({ tint }: { tint: THREE.Color }) {
  const tier = useTier();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const points = useRef<THREE.Points>(null);
  const { material, uniforms } = useMemo(() => createModelMaterial({ variant: "white", patternSpace: "world" }), []);
  const lots = useMemo(() => {
    const rnd = seeded(7);
    const out: { x: number; z: number; w: number; d: number; h: number }[] = [];
    const step = 15;
    const n = tier === "low" ? 8 : 12;
    for (let i = -n; i <= n; i++)
      for (let j = -n; j <= n; j++) {
        const x = i * step + (rnd() - 0.5) * 3;
        const z = j * step + (rnd() - 0.5) * 3;
        if (Math.abs(x) < 30 && Math.abs(z) < 26) continue;
        // Keep the pull-back corridor (+X, +Z diagonal) clear.
        if (x > 0 && z > 0 && Math.abs(x * 0.8 - z * 0.6) < 22) continue;
        if (rnd() < 0.12) continue;
        const dist = Math.hypot(x, z) / (n * step);
        out.push({ x, z, w: 7 + rnd() * 5, d: 7 + rnd() * 5, h: 5 + Math.pow(rnd(), 2) * 45 * (1.2 - dist) });
      }
    return out;
  }, [tier]);
  const cloud = useMemo(() => {
    const rnd = seeded(11);
    const count = tier === "low" ? 12000 : 45000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const l = lots[(rnd() * lots.length) | 0];
      const face = rnd();
      let x: number, y: number, z: number;
      if (face < 0.35) {
        x = l.x + (rnd() - 0.5) * l.w;
        z = l.z + (rnd() - 0.5) * l.d;
        y = l.h;
      } else if (face < 0.9) {
        const side = (rnd() * 4) | 0;
        y = rnd() * l.h;
        const u = rnd() - 0.5;
        x = l.x + (side < 2 ? u * l.w : (side === 2 ? 0.5 : -0.5) * l.w);
        z = l.z + (side < 2 ? (side === 0 ? 0.5 : -0.5) * l.d : u * l.d);
      } else {
        x = (rnd() - 0.5) * 360;
        z = (rnd() - 0.5) * 360;
        y = 0;
      }
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [lots, tier]);
  const cloudMat = useMemo(
    () => new THREE.PointsMaterial({ color: COLORS.cloud, size: 0.55, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false }),
    [],
  );
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const lastGrow = useRef(-1);

  useFrame(() => {
    const im = mesh.current;
    if (!im) return;
    const grow = S.city;
    im.visible = grow > 0.001 && S.cloud < 0.7;
    uniforms.uTint.value.copy(tint);
    if (points.current) {
      points.current.visible = S.cloud > 0.001;
      cloudMat.opacity = S.cloud * 0.9;
    }
    if (grow === lastGrow.current) return;
    lastGrow.current = grow;
    const rnd = seeded(3);
    for (let i = 0; i < lots.length; i++) {
      const l = lots[i];
      const delay = rnd() * 0.5;
      const g = easeInOutCubic(clamp((grow - delay) / 0.5));
      dummy.position.set(l.x, (l.h * g) / 2, l.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(l.w, Math.max(l.h * g, 1e-3), l.d);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[geometry, material, lots.length]} castShadow receiveShadow frustumCulled={false} />
      <points ref={points} geometry={cloud} material={cloudMat} frustumCulled={false} />
    </>
  );
}

/** Everything in "site space": the canopy at 1:50 on the table, then at 1:1, then the city. */
export function Site() {
  const group = useRef<THREE.Group>(null);
  const ground = useRef<THREE.Mesh>(null);
  const board = useRef<THREE.Mesh>(null);
  const structure = useRef<THREE.Group>(null);
  const members = useMemo(() => buildMembers(), []);
  const gaps = useMemo(() => gapMembers(members, GAP_COUNT), [members]);
  const glulam = useMemo(() => createModelMaterial({ variant: "glulam", patternSpace: "instance" }), []);
  const plinth = useMemo(() => createModelMaterial({ variant: "white", patternSpace: "instance" }).material, []);
  const tint = useMemo(() => new THREE.Color(1, 1, 1), []);
  const night = useMemo(() => new THREE.Color("#2A3240"), []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.visible = S.view > 1.6 && S.view < 7;
    g.scale.setScalar(S.siteS);
    g.position.copy(S.siteOrigin);
    if (!g.visible) g.position.y = -500;
    if (ground.current) ground.current.visible = S.jump > 0.55;
    if (board.current) {
      board.current.visible = S.board > 0.001;
      board.current.scale.set(31 * S.board, 0.3, 23 * S.board);
    }
    if (structure.current) {
      const c = smooth(0.8, 0.9, S.a.design) + (S.view >= 2 ? 1 : 0);
      structure.current.visible = c > 0.001;
      structure.current.scale.set(1, Math.min(c, 1), 1);
    }
    tint.setRGB(1, 1, 1).lerp(night, S.night);
    glulam.uniforms.uTint.value.copy(tint);
  });

  return (
    <group ref={group}>
      <mesh ref={ground} rotation-x={-Math.PI / 2} position={[0, -0.3, 0]} receiveShadow>
        <planeGeometry args={[1400, 1400]} />
        <shadowMaterial opacity={0.34} color="#3c342c" />
      </mesh>
      <mesh ref={board} position={[0, -0.15, 0]} material={plinth} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <group ref={structure}>
        <Structure />
      </group>
      <Canopy members={members} gaps={gaps} material={glulam.material} />
      <Fabrication members={members} gaps={gaps} material={glulam.material} />
      <City tint={tint} />
    </group>
  );
}
