import type { Seg } from "../lines/DrawLines";
import { CANOPY, buildMembers } from "../canopy/field";

/**
 * Procedural drafting sheet (plan + section of the canopy), in sheet-local
 * coordinates: x ∈ [-w/2, w/2], z ∈ [-d/2, d/2], y = 0. Illustrative only.
 */
export function drawingSegments(w: number, d: number): { ink: Seg[]; accent: Seg[] } {
  const ink: Seg[] = [];
  const accent: Seg[] = [];
  const L = (a: number, b: number, c: number, e: number, out = ink) => out.push([a, 0, b, c, 0, e]);
  const rect = (x0: number, z0: number, x1: number, z1: number, out = ink) => {
    L(x0, z0, x1, z0, out);
    L(x1, z0, x1, z1, out);
    L(x1, z1, x0, z1, out);
    L(x0, z1, x0, z0, out);
  };
  const circle = (cx: number, cz: number, r: number, n = 20, out = ink) => {
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 1) / n) * Math.PI * 2;
      L(cx + Math.cos(a0) * r, cz + Math.sin(a0) * r, cx + Math.cos(a1) * r, cz + Math.sin(a1) * r, out);
    }
  };

  const hw = w / 2;
  const hd = d / 2;
  // Border and title block.
  rect(-hw + 0.018, -hd + 0.018, hw - 0.018, hd - 0.018);
  rect(hw - 0.2, hd - 0.07, hw - 0.018, hd - 0.018);
  L(hw - 0.2, hd - 0.044, hw - 0.018, hd - 0.044);
  L(hw - 0.12, hd - 0.07, hw - 0.12, hd - 0.018);

  // Plan (left half): canopy outline, grid axes with bubbles, columns.
  const px = -hw * 0.48;
  const pz = -0.02;
  const sx = 0.016; // metres → sheet
  const cw = (CANOPY.width / 2) * sx;
  const cd = (CANOPY.depth / 2) * sx;
  for (let i = -2; i <= 2; i++) {
    const x = px + i * 5 * sx;
    L(x, pz - cd - 0.03, x, pz + cd + 0.03);
    circle(x, pz - cd - 0.04, 0.008, 12);
  }
  for (let j = -1; j <= 1; j++) {
    const z = pz + j * 5 * sx;
    L(px - cw - 0.03, z, px + cw + 0.03, z);
    circle(px - cw - 0.04, z, 0.008, 12);
  }
  rect(px - cw, pz - cd, px + cw, pz + cd);
  rect(px - cw + 0.004, pz - cd + 0.004, px + cw - 0.004, pz + cd - 0.004);
  // Beam lines in plan (every 4th beam).
  const members = buildMembers();
  const nz = Math.floor(CANOPY.depth / CANOPY.member);
  const nx = members.length / nz;
  for (let i = 0; i < nx; i += 4) {
    const x = px + members[i * nz].x * sx;
    L(x, pz - cd + 0.004, x, pz + cd - 0.004);
  }
  // Dimension line under the plan.
  const dz = pz + cd + 0.055;
  L(px - cw, dz, px + cw, dz);
  L(px - cw, dz - 0.008, px - cw, dz + 0.008);
  L(px + cw, dz - 0.008, px + cw, dz + 0.008);
  // North arrow.
  circle(px + cw + 0.05, pz - cd + 0.01, 0.018, 20);
  L(px + cw + 0.05, pz - cd + 0.028, px + cw + 0.05, pz - cd - 0.012);

  // Section (right half): ground, columns and the undulating soffit.
  const qx = hw * 0.42;
  const qz = 0.05;
  const s2 = 0.014;
  const half = (CANOPY.width / 2) * s2;
  L(qx - half - 0.03, qz, qx + half + 0.03, qz);
  for (let i = -2; i <= 2; i += 2) {
    const x = qx + i * 5 * s2 * 0.75;
    L(x, qz, x, qz - CANOPY.top * s2 * 0.82);
  }
  const topZ = qz - CANOPY.top * s2;
  L(qx - half, topZ, qx + half, topZ);
  // Soffit profile along the middle row, drawn in the accent colour.
  const midRow = Math.floor(nz / 2);
  let prev: [number, number] | null = null;
  for (let i = 0; i < nx; i++) {
    const m = members[i * nz + midRow];
    const x = qx + m.x * s2;
    const z = topZ + m.depth * s2;
    if (prev) L(prev[0], prev[1], x, z, accent);
    prev = [x, z];
  }
  // Level marks.
  L(qx + half + 0.012, topZ, qx + half + 0.03, topZ);
  L(qx + half + 0.012, qz, qx + half + 0.03, qz);

  return { ink, accent };
}
