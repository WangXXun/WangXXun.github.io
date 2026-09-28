"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";

export type Seg = [number, number, number, number, number, number];

/**
 * Line segments revealed stroke by stroke. Segments are drawn in array order;
 * `uProgress` 0→1 draws all of them. Optional second position set for morphing.
 */
export function makeDrawGeometry(segs: Seg[], morphTo?: Seg[]) {
  const n = segs.length;
  const pos = new Float32Array(n * 6);
  const pos2 = new Float32Array(n * 6);
  const t = new Float32Array(n * 2);
  let total = 0;
  const lens = segs.map((s) => Math.hypot(s[3] - s[0], s[4] - s[1], s[5] - s[2]));
  lens.forEach((l) => (total += l));
  let acc = 0;
  segs.forEach((s, i) => {
    pos.set(s, i * 6);
    pos2.set(morphTo ? morphTo[i] : s, i * 6);
    t[i * 2] = acc / total;
    acc += lens[i];
    t[i * 2 + 1] = acc / total;
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aTo", new THREE.BufferAttribute(pos2, 3));
  g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
  g.computeBoundingSphere();
  return g;
}

export function makeDrawMaterial(color = "#1A1A1A", opacity = 1) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uProgress: { value: 0 },
      uMorph: { value: 0 },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aTo;
      attribute float aT;
      uniform float uMorph;
      varying float vT;
      void main() {
        vT = aT;
        vec3 p = mix(position, aTo, uMorph);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform float uOpacity;
      uniform vec3 uColor;
      varying float vT;
      void main() {
        if (vT > uProgress) discard;
        gl_FragColor = vec4(uColor, uOpacity);
        #include <colorspace_fragment>
      }
    `,
  });
}

export const DrawLines = forwardRef<
  THREE.LineSegments,
  { segs: Seg[]; morphTo?: Seg[]; color?: string; opacity?: number } & Omit<
    React.ComponentProps<"lineSegments">,
    "args"
  >
>(function DrawLines({ segs, morphTo, color, opacity, ...rest }, ref) {
  const geometry = useMemo(() => makeDrawGeometry(segs, morphTo), [segs, morphTo]);
  const material = useMemo(() => makeDrawMaterial(color, opacity), [color, opacity]);
  return <lineSegments ref={ref} geometry={geometry} material={material} frustumCulled={false} {...rest} />;
});

/** The 12 edges of an axis-aligned box, ordered like a hand drawing it. */
export function boxEdges(w: number, h: number, d: number, cx = 0, cy = 0, cz = 0): Seg[] {
  const x = w / 2, y = h / 2, z = d / 2;
  const v = (sx: number, sy: number, sz: number) => [cx + sx * x, cy + sy * y, cz + sz * z] as const;
  const e = (a: readonly number[], b: readonly number[]): Seg => [a[0], a[1], a[2], b[0], b[1], b[2]];
  return [
    e(v(-1, -1, 1), v(1, -1, 1)),
    e(v(1, -1, 1), v(1, -1, -1)),
    e(v(1, -1, -1), v(-1, -1, -1)),
    e(v(-1, -1, -1), v(-1, -1, 1)),
    e(v(-1, -1, 1), v(-1, 1, 1)),
    e(v(1, -1, 1), v(1, 1, 1)),
    e(v(1, -1, -1), v(1, 1, -1)),
    e(v(-1, -1, -1), v(-1, 1, -1)),
    e(v(-1, 1, 1), v(1, 1, 1)),
    e(v(1, 1, 1), v(1, 1, -1)),
    e(v(1, 1, -1), v(-1, 1, -1)),
    e(v(-1, 1, -1), v(-1, 1, 1)),
  ];
}
