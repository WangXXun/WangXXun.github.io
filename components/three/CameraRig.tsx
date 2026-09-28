"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { S, dampFactor } from "@/lib/director/state";
import { bus } from "@/lib/scroll/bus";
import { smooth } from "@/lib/director/math";

const pos = new THREE.Vector3();
const tgt = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3();

export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const first = useRef(true);
  const smoothTgt = useRef(new THREE.Vector3());
  const par = useRef(new THREE.Vector2());

  useFrame(() => {
    const k = first.current ? 1 : dampFactor(bus.delta, bus.reduced);
    first.current = false;

    // Pointer parallax only where the camera is otherwise calm.
    const calm = (1 - smooth(0.25, 0.6, S.view)) + smooth(7.05, 7.3, S.view);
    const pk = bus.reduced ? 0 : calm;
    par.current.x += (bus.pointer.x * pk - par.current.x) * Math.min(bus.delta * 3, 1);
    par.current.y += (bus.pointer.y * pk - par.current.y) * Math.min(bus.delta * 3, 1);

    pos.copy(S.camPos);
    tgt.copy(S.camTgt);
    const dist = pos.distanceTo(tgt);
    right.subVectors(tgt, pos).cross(camera.up).normalize();
    up.copy(camera.up);
    pos.addScaledVector(right, par.current.x * dist * 0.035).addScaledVector(up, par.current.y * dist * 0.02);

    camera.position.lerp(pos, k);
    smoothTgt.current.lerp(tgt, k);
    camera.lookAt(smoothTgt.current);

    const near = S.view > 1.8 && S.view < 2.25 ? Math.max(0.002, 0.05 * S.siteS) : S.view >= 2.9 ? 0.2 : 0.02;
    const fov = camera.fov + (S.fov - camera.fov) * k;
    if (Math.abs(fov - camera.fov) > 1e-4 || camera.near !== near) {
      camera.fov = fov;
      camera.near = near;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
