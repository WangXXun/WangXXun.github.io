/**
 * Parametric timber canopy — one generator shared by the 1:50 design model
 * (01 DESIGN) and the 1:1 build (02 BUILD). Units are metres at 1:1.
 * Illustrative only; not the built geometry.
 */

export const CANOPY = {
  width: 22, // along X (beams are arrayed across X)
  depth: 16, // along Z (beam direction)
  top: 5.4, // top of beams
  spacing: 0.34,
  member: 0.8, // member length along the beam
  thickness: 0.09,
  minDepth: 0.22,
  maxDepth: 1.35,
} as const;

export interface Member {
  x: number;
  z: number;
  depth: number;
  tilt: number;
  /** Normalised distance from the arm corner, for growth order. */
  order: number;
  beam: number;
  seg: number;
}

function field(u: number, v: number) {
  // u, v in [-1, 1]. Two soft attractors + a long wave.
  const a = Math.exp(-((u + 0.35) ** 2 * 3.2 + (v - 0.2) ** 2 * 4.0));
  const b = Math.exp(-((u - 0.45) ** 2 * 4.5 + (v + 0.35) ** 2 * 3.0));
  const w = 0.5 + 0.5 * Math.sin(u * 2.4 + v * 1.3 + 0.6);
  return Math.min(1, 0.15 + 0.55 * a + 0.45 * b + 0.25 * w);
}

export function buildMembers(): Member[] {
  const { width, depth, spacing, member, minDepth, maxDepth } = CANOPY;
  const nx = Math.floor(width / spacing);
  const nz = Math.floor(depth / member);
  const out: Member[] = [];
  const x0 = -((nx - 1) * spacing) / 2;
  const z0 = -((nz - 1) * member) / 2;
  const cornerU = 0.55;
  const cornerV = 0.75;
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      const x = x0 + i * spacing;
      const z = z0 + j * member;
      const u = x / (width / 2);
      const v = z / (depth / 2);
      const f = field(u, v);
      const e = 0.02;
      const dfdu = (field(u + e, v) - field(u - e, v)) / (2 * e);
      out.push({
        x,
        z,
        depth: minDepth + (maxDepth - minDepth) * f,
        tilt: dfdu * 0.16,
        order: Math.hypot(u - cornerU, v - cornerV) / 2.4,
        beam: i,
        seg: j,
      });
    }
  }
  return out;
}

/** Members left open at the start of 02 BUILD, filled one by one by the robot. */
export function gapMembers(members: Member[], count = 6): number[] {
  const nz = Math.floor(CANOPY.depth / CANOPY.member);
  const picks: number[] = [];
  const targets = [
    [34, 14],
    [36, 12],
    [38, 15],
    [40, 13],
    [42, 16],
    [44, 14],
  ];
  for (let k = 0; k < Math.min(count, targets.length); k++) {
    const [bi, sj] = targets[k];
    const idx = bi * nz + sj;
    if (idx < members.length) picks.push(idx);
  }
  return picks;
}
