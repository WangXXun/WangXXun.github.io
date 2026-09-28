"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { COLORS } from "@/lib/story";

export const ARM = {
  shoulderH: 0.72,
  upper: 1.05,
  fore: 0.95,
  tool: 0.34,
};

export interface RobotArmHandle {
  /** Place the tool tip at a point given in the arm's parent space, tool pointing down. */
  reach: (target: THREE.Vector3, base: THREE.Vector3) => void;
  tip: THREE.Object3D | null;
}

const tmp = new THREE.Vector3();

/** Six-axis industrial arm, matte white with signal-orange joint rings. Analytic IK. */
export const RobotArm = forwardRef<RobotArmHandle, { spinTool?: number }>(function RobotArm(_, ref) {
  const yaw = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const wrist = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Group>(null);

  const mats = useMemo(
    () => ({
      shell: new THREE.MeshPhysicalMaterial({ color: "#EFEEEA", roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.35 }),
      dark: new THREE.MeshStandardMaterial({ color: "#26272A", roughness: 0.5, metalness: 0.4 }),
      ring: new THREE.MeshStandardMaterial({ color: COLORS.orange, roughness: 0.45, emissive: COLORS.orange, emissiveIntensity: 0.25 }),
    }),
    [],
  );
  const geo = useMemo(
    () => ({
      upper: new RoundedBoxGeometry(0.22, ARM.upper + 0.1, 0.26, 4, 0.06),
      fore: new RoundedBoxGeometry(0.17, ARM.fore + 0.06, 0.19, 4, 0.05),
      housing: new RoundedBoxGeometry(0.42, 0.34, 0.4, 4, 0.08),
    }),
    [],
  );

  useImperativeHandle(ref, () => ({
    tip: tip.current,
    reach(target, base) {
      tmp.copy(target).sub(base);
      const wx = tmp.x;
      const wz = tmp.z;
      const wy = tmp.y + ARM.tool;
      const q1 = Math.atan2(wx, wz);
      const r = Math.hypot(wx, wz);
      const h = wy - ARM.shoulderH;
      const a1 = ARM.upper;
      const a2 = ARM.fore;
      const d = Math.min(Math.hypot(r, h), a1 + a2 - 1e-3);
      const cos2 = THREE.MathUtils.clamp((d * d - a1 * a1 - a2 * a2) / (2 * a1 * a2), -1, 1);
      const q3 = Math.acos(cos2);
      const gamma = Math.atan2(r, h);
      const beta = Math.atan2(a2 * Math.sin(q3), a1 + a2 * Math.cos(q3));
      const q2 = gamma - beta;
      if (yaw.current) yaw.current.rotation.y = q1;
      if (shoulder.current) shoulder.current.rotation.x = q2;
      if (elbow.current) elbow.current.rotation.x = q3;
      if (wrist.current) wrist.current.rotation.x = Math.PI - (q2 + q3);
    },
  }));

  const ring = (r: number, rot: [number, number, number] = [Math.PI / 2, 0, 0], y = 0) => (
    <mesh material={mats.ring} rotation={rot} position={[0, y, 0]} castShadow>
      <torusGeometry args={[r, 0.018, 10, 40]} />
    </mesh>
  );

  return (
    <group>
      {/* pedestal + base */}
      <mesh material={mats.dark} position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.18, 40]} />
      </mesh>
      <group ref={yaw} position={[0, 0.18, 0]}>
        <mesh material={mats.shell} position={[0, 0.14, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.27, 0.3, 0.28, 40]} />
        </mesh>
        {ring(0.285, [Math.PI / 2, 0, 0], 0.03)}
        <mesh geometry={geo.housing} material={mats.shell} position={[0, ARM.shoulderH - 0.18, 0]} castShadow />
        <group ref={shoulder} position={[0, ARM.shoulderH - 0.18, 0]}>
          <mesh material={mats.shell} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.17, 0.17, 0.46, 36]} />
          </mesh>
          {ring(0.175, [0, Math.PI / 2, 0])}
          <mesh geometry={geo.upper} material={mats.shell} position={[0, ARM.upper / 2, 0]} castShadow />
          <group ref={elbow} position={[0, ARM.upper, 0]}>
            <mesh material={mats.shell} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.13, 0.13, 0.34, 32]} />
            </mesh>
            {ring(0.135, [0, Math.PI / 2, 0])}
            <mesh geometry={geo.fore} material={mats.shell} position={[0, ARM.fore / 2, 0]} castShadow />
            <group ref={wrist} position={[0, ARM.fore, 0]}>
              <mesh material={mats.shell} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.085, 0.085, 0.22, 28]} />
              </mesh>
              {ring(0.09, [0, Math.PI / 2, 0])}
              <mesh material={mats.shell} position={[0, 0.1, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.08, 0.14, 28]} />
              </mesh>
              <mesh material={mats.dark} position={[0, 0.22, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.055, 0.12, 24]} />
              </mesh>
              {ring(0.058, [Math.PI / 2, 0, 0], 0.17)}
              <mesh material={mats.dark} position={[0, 0.3, 0]} castShadow>
                <cylinderGeometry args={[0.012, 0.02, 0.06, 12]} />
              </mesh>
              <group ref={tip} position={[0, ARM.tool, 0]} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
});
