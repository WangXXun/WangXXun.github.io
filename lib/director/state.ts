import { Color, Vector3 } from "three";
import type { ScrollBus } from "@/lib/scroll/bus";
import { ACTS, THEME_BG, type ActId } from "@/lib/story";
import {
  HERO_POS,
  INDEX_ORIGIN,
  JUMP_EYE,
  K0,
  PROLOGUE_LIFT,
  SITE_ORIGIN_0,
  SITE_SCALE_0,
} from "./constants";
import { bump, clamp, damp, easeInOutCubic, invLerp, lerp, smooth, smoother } from "./math";
import { VARIANTS, VARIANT_LABEL, type Variant } from "@/components/three/materials/modelMaterial";

type Space = "room" | "site" | "index";

interface Key {
  c: number;
  space: Space;
  pos: [number, number, number];
  tgt: [number, number, number];
  fov: number;
  hold?: boolean;
  /** Hard cut into this key (masked by the veil). */
  cut?: boolean;
}

const orbit = (
  c: number,
  space: Space,
  center: [number, number, number],
  r: number,
  h: number,
  deg: number,
  fov: number,
): Key => {
  const a = (deg * Math.PI) / 180;
  return {
    c,
    space,
    pos: [center[0] + Math.sin(a) * r, center[1] + h, center[2] + Math.cos(a) * r],
    tgt: center,
    fov,
  };
};

const H: [number, number, number] = [HERO_POS.x, HERO_POS.y, HERO_POS.z];
const ARM_C: [number, number, number] = [2.2, 1.2, 4.1];

/** Camera keyframes, keyed by story cursor (act index + local progress). */
export const KEYS: Key[] = [
  // Prologue — room space at K0 scale (block = room shrunk).
  { c: 0.0, space: "room", pos: [8.2, 4.6, 14.2], tgt: [0, 1.8, 0], fov: 30 },
  { c: 0.45, space: "room", pos: [5.6, 3.4, 10.4], tgt: [0, 1.8, 0], fov: 30 },
  { c: 0.74, space: "room", pos: [1.3, 2.1, 5.9], tgt: [0.2, 1.8, 0], fov: 32 },
  // 01 Design — inside the room (unfold completes around the camera).
  { c: 1.04, space: "room", pos: [1.2, 1.62, 1.35], tgt: [-1.8, 1.45, -0.55], fov: 42 },
  { c: 1.12, space: "room", pos: [0.95, 1.58, 1.15], tgt: [-1.2, 0.9, -0.8], fov: 42 },
  { c: 1.2, space: "room", pos: [0.25, 1.85, 0.05], tgt: [-0.55, 0.77, -1.08], fov: 36 },
  { c: 1.3, space: "room", pos: [-0.3, 1.55, -0.28], tgt: [-0.6, 0.77, -1.08], fov: 32 },
  orbit(1.37, "room", H, 0.95, 0.3, 28, 30),
  orbit(1.47, "room", H, 0.9, 0.26, 10, 30),
  orbit(1.57, "room", H, 0.9, 0.22, -12, 30),
  orbit(1.66, "room", H, 0.9, 0.24, -38, 30),
  orbit(1.74, "room", H, 1.1, 0.5, -30, 31),
  // Modeling → the 1:50 canopy model (site space, metres at 1:1).
  { c: 1.82, space: "site", pos: [24, 25, 34], tgt: [0, 3.0, 0], fov: 32 },
  { c: 1.9, space: "site", pos: [13, 9.5, 18], tgt: [0, 3.6, 0], fov: 36 },
  { c: 1.96, space: "site", pos: [7.5, 3.2, 10.5], tgt: [0, 4.2, -0.5], fov: 46 },
  // Scale jump: camera holds while the model grows around it.
  { c: 2.0, space: "site", pos: [JUMP_EYE.x, JUMP_EYE.y, JUMP_EYE.z], tgt: [-0.5, 4.8, -1.5], fov: 58, hold: true },
  { c: 2.2, space: "site", pos: [JUMP_EYE.x, JUMP_EYE.y, JUMP_EYE.z], tgt: [-0.5, 4.8, -1.5], fov: 58, hold: true },
  // 02 Build — 1:1.
  { c: 2.32, space: "site", pos: [4.8, 1.7, 6.6], tgt: [2.6, 4.2, 3.4], fov: 52 },
  { c: 2.44, space: "site", pos: [5.8, 1.75, 8.2], tgt: [2.2, 1.4, 3.8], fov: 44 },
  orbit(2.58, "site", ARM_C, 5.2, 0.5, 35, 42),
  orbit(2.72, "site", ARM_C, 5.0, 0.7, -20, 42),
  orbit(2.86, "site", ARM_C, 5.2, 0.9, -85, 42),
  orbit(2.97, "site", ARM_C, 5.8, 1.4, -140, 42),
  // → 03 City (placeholder): Powers of Ten pull-back.
  { c: 3.12, space: "site", pos: [20, 18, 26], tgt: [0, 3, 0], fov: 40 },
  { c: 3.5, space: "site", pos: [72, 105, 96], tgt: [0, 0, 0], fov: 35 },
  { c: 4.0, space: "site", pos: [150, 140, 150], tgt: [0, 0, 0], fov: 32 },
  // 04 Evaluate (placeholder)
  { c: 4.6, space: "site", pos: [185, 150, 60], tgt: [0, 0, 0], fov: 32 },
  { c: 5.0, space: "site", pos: [160, 110, -60], tgt: [0, 0, 0], fov: 34 },
  // 05 Reconstruct (placeholder)
  { c: 5.6, space: "site", pos: [90, 55, -110], tgt: [0, 6, 0], fov: 38 },
  { c: 6.0, space: "site", pos: [40, 22, -80], tgt: [0, 6, 0], fov: 42 },
  // 06 Embody (placeholder)
  { c: 6.6, space: "site", pos: [18, 12, -40], tgt: [0, 4, 0], fov: 44 },
  { c: 6.95, space: "site", pos: [8, 30, -20], tgt: [0, 0, 0], fov: 40 },
  // Index — cut to the index stage.
  { c: 7.0, space: "index", pos: [3.2, 2.1, 7.4], tgt: [2.4, 0.05, 0], fov: 26, cut: true },
  { c: 8.0, space: "index", pos: [3.0, 4.4, 6.6], tgt: [2.4, 1.7, 0], fov: 26 },
];

/** Reduced motion: static keyframes per sub-section. */
const STOPS = [0.15, 1.1, 1.26, 1.34, 1.42, 1.5, 1.58, 1.66, 1.9, 2.3, 2.62, 2.9, 3.5, 4.5, 5.5, 6.5, 7.3];

const STAGES: { at: number; v: Variant }[] = [
  { at: 0.3, v: "paper" },
  { at: 0.38, v: "foam" },
  { at: 0.46, v: "board" },
  { at: 0.54, v: "wood" },
  { at: 0.62, v: "print" },
];
const SWEEP = 0.055;

export const GAP_COUNT = 6;
export const BUILD_CYCLE = { start: 0.34, end: 0.94 };

export interface SceneState {
  view: number;
  a: Record<ActId, number>;
  veil: number;
  intro: number;
  sunHour: number;
  // room / prologue
  roomK: number;
  roomY: number;
  unfold: number;
  flapFront: number;
  flapTop: number;
  roomAway: number;
  prologueBlock: boolean;
  // design
  drawing: number;
  vFrom: number;
  vTo: number;
  vMix: number;
  heroCut: number;
  wire: number;
  wireFade: number;
  net: number;
  netMorph: number;
  netFade: number;
  canopyGrow: number;
  board: number;
  // site
  jump: number;
  siteS: number;
  siteOrigin: Vector3;
  // build
  cycle: number;
  cyclePhase: number;
  gapsFilled: number;
  robot: number;
  // later placeholders
  city: number;
  night: number;
  cloud: number;
  // camera
  camPos: Vector3;
  camTgt: Vector3;
  fov: number;
  // hud
  scaleText: string;
  stageLabel: string;
  tags: string[];
  sunVisible: boolean;
  bg: Color;
  dark: number;
}

export const S: SceneState = {
  view: 0,
  a: Object.fromEntries(ACTS.map((x) => [x.id, 0])) as Record<ActId, number>,
  veil: 0,
  intro: 0,
  sunHour: 10,
  roomK: K0,
  roomY: PROLOGUE_LIFT,
  unfold: 0,
  flapFront: 0,
  flapTop: 0,
  roomAway: 0,
  prologueBlock: true,
  drawing: 0,
  vFrom: 0,
  vTo: 0,
  vMix: 0,
  heroCut: 1.2,
  wire: 0,
  wireFade: 0,
  net: 0,
  netMorph: 0,
  netFade: 0,
  canopyGrow: 0,
  board: 0,
  jump: 0,
  siteS: SITE_SCALE_0,
  siteOrigin: SITE_ORIGIN_0.clone(),
  cycle: 0,
  cyclePhase: 0,
  gapsFilled: 0,
  robot: 0,
  city: 0,
  night: 0,
  cloud: 0,
  camPos: new Vector3(),
  camTgt: new Vector3(),
  fov: 30,
  scaleText: "1:100",
  stageLabel: "",
  tags: [],
  sunVisible: false,
  bg: new Color(THEME_BG.paper),
  dark: 0,
};

// Pivot of the scale jump: the world point that stays fixed while the site grows.
const JUMP_PIVOT = SITE_ORIGIN_0.clone().addScaledVector(JUMP_EYE, SITE_SCALE_0);

const tmpA = new Vector3();
const tmpB = new Vector3();
const tmpC = new Vector3();
const tmpD = new Vector3();
const colA = new Color();
const colB = new Color();

function toWorld(space: Space, p: [number, number, number], out: Vector3) {
  out.set(p[0], p[1], p[2]);
  if (space === "room") {
    out.multiplyScalar(S.roomK);
    out.y += S.roomY;
  } else if (space === "site") {
    out.multiplyScalar(S.siteS).add(S.siteOrigin);
  } else {
    out.add(INDEX_ORIGIN);
  }
  return out;
}

function hermite(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, t: number, h1: boolean, h2: boolean, out: Vector3) {
  // Catmull-Rom tangents, zeroed at held keys.
  const m1 = h1 ? tmpC.set(0, 0, 0) : tmpC.subVectors(p2, p0).multiplyScalar(0.5);
  const m2 = h2 ? tmpD.set(0, 0, 0) : tmpD.subVectors(p3, p1).multiplyScalar(0.5);
  const t2 = t * t;
  const t3 = t2 * t;
  const a = 2 * t3 - 3 * t2 + 1;
  const b = t3 - 2 * t2 + t;
  const c = -2 * t3 + 3 * t2;
  const d = t3 - t2;
  return out.set(
    a * p1.x + b * m1.x + c * p2.x + d * m2.x,
    a * p1.y + b * m1.y + c * p2.y + d * m2.y,
    a * p1.z + b * m1.z + c * p2.z + d * m2.z,
  );
}

const P = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];
const T = [new Vector3(), new Vector3(), new Vector3(), new Vector3()];

function sampleCamera(c: number) {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1].c <= c) i++;
  const k1 = KEYS[i];
  const k2 = KEYS[i + 1];
  const k0 = KEYS[Math.max(i - 1, 0)];
  const k3 = KEYS[Math.min(i + 2, KEYS.length - 1)];
  let t = clamp((c - k1.c) / (k2.c - k1.c));
  if (k2.cut) t = 0;

  const sameSpace = k0.space === k1.space && k1.space === k2.space && k2.space === k3.space;
  const ks = [k0, k1, k2, k3];
  const noCutNeighbours = !k1.cut && !k2.cut && !k3.cut;
  for (let j = 0; j < 4; j++) {
    const k = ks[j];
    if (sameSpace && noCutNeighbours) {
      P[j].set(...k.pos);
      T[j].set(...k.tgt);
    } else {
      toWorld(k.space, k.pos, P[j]);
      toWorld(k.space, k.tgt, T[j]);
    }
  }
  if (!noCutNeighbours) {
    // Don't let tangents reach across a cut.
    if (k2.cut || k3.cut) {
      P[3].copy(P[2]);
      T[3].copy(T[2]);
    }
    if (k1.cut) {
      P[0].copy(P[1]);
      T[0].copy(T[1]);
    }
  }
  hermite(P[0], P[1], P[2], P[3], t, !!k1.hold, !!k2.hold, tmpA);
  hermite(T[0], T[1], T[2], T[3], t, !!k1.hold, !!k2.hold, tmpB);
  if (sameSpace && noCutNeighbours) {
    toWorld(k1.space, [tmpA.x, tmpA.y, tmpA.z], S.camPos);
    toWorld(k1.space, [tmpB.x, tmpB.y, tmpB.z], S.camTgt);
  } else {
    S.camPos.copy(tmpA);
    S.camTgt.copy(tmpB);
  }
  S.fov = lerp(k1.fov, k2.fov, smooth(0, 1, t));
}

let reducedTarget = -1;
let reducedPending = -1;
let veilT = 1;

function computeView(b: ScrollBus) {
  if (!b.reduced) {
    S.veil = 0;
    return b.cursor;
  }
  let best = STOPS[0];
  for (const s of STOPS) if (Math.abs(s - b.cursor) < Math.abs(best - b.cursor)) best = s;
  if (reducedTarget < 0) {
    reducedTarget = best;
    reducedPending = best;
  }
  if (best !== reducedPending) {
    reducedPending = best;
    veilT = 0;
  }
  veilT = Math.min(veilT + b.delta / 0.3, 1);
  if (veilT >= 0.5) reducedTarget = reducedPending;
  S.veil = veilT < 1 ? 1 - Math.abs(veilT - 0.5) * 2 : 0;
  return reducedTarget;
}

function scaleLabel(v: number) {
  return `1:${v >= 100 ? Math.round(v / 10) * 10 : Math.max(1, Math.round(v))}`;
}

function actColor(id: ActId) {
  return THEME_BG[ACTS.find((a) => a.id === id)!.theme];
}

let introStart = -1;

export function derive(b: ScrollBus) {
  const view = computeView(b);
  S.view = view;
  for (let i = 0; i < ACTS.length; i++) S.a[ACTS[i].id] = clamp(view - i);
  const d = S.a.design;
  const bu = S.a.build;

  // Prologue intro (time-based "drawing" of the 12 edges).
  if (introStart < 0) introStart = b.time;
  S.intro = b.reduced ? 1 : clamp((b.time - introStart - 0.25) / 1.9);

  // Unfold: the block becomes the room around the camera.
  const U = smoother(0.5, 1.06, view);
  S.unfold = U;
  S.roomK = K0 * Math.pow(1 / K0, U);
  S.roomY = PROLOGUE_LIFT * (1 - smooth(0, 0.7, U));
  S.prologueBlock = view < 0.62;
  S.flapFront = 1.9 * bump(0.6, 0.72, 0.9, 1.05, view);
  S.flapTop = 1.2 * bump(0.6, 0.74, 0.88, 1.02, view);

  // Design stages.
  S.drawing = invLerp(0.12, 0.3, d);
  let from = 0;
  let to = 0;
  let mix = 0;
  let label = d > 0.12 ? "DRAWING" : "";
  for (let i = 0; i < STAGES.length; i++) {
    const s = STAGES[i];
    const prev = i === 0 ? 0 : VARIANTS.indexOf(STAGES[i - 1].v);
    const cur = VARIANTS.indexOf(s.v);
    if (d >= s.at) {
      from = prev;
      to = cur;
      mix = invLerp(s.at, s.at + SWEEP, d);
      label = VARIANT_LABEL[s.v];
    }
  }
  S.vFrom = from;
  S.vTo = to;
  S.vMix = mix;
  S.wire = invLerp(0.68, 0.73, d);
  S.heroCut = lerp(1.15, -0.15, invLerp(0.7, 0.76, d));
  S.net = invLerp(0.73, 0.79, d);
  S.netMorph = smoother(0.78, 0.87, d);
  S.wireFade = smooth(0.77, 0.82, d);
  S.board = smooth(0.78, 0.84, d);
  S.canopyGrow = invLerp(0.82, 0.95, d);
  S.netFade = smooth(0.94, 1.0, d);
  if (d >= 0.7) label = "PARAMETRIC MODEL";
  if (b.cursor < 1.1 || view >= 2) label = "";
  S.stageLabel = label;

  // Scale jump (end of design → start of build).
  S.jump = smoother(2.0, 2.2, view);
  S.siteS = SITE_SCALE_0 * Math.pow(1 / SITE_SCALE_0, S.jump);
  S.siteOrigin.copy(JUMP_PIVOT).addScaledVector(JUMP_EYE, -S.siteS);
  S.roomAway = smooth(1.99, 2.14, view);

  // Robot cycles.
  const cyc = invLerp(BUILD_CYCLE.start, BUILD_CYCLE.end, bu) * GAP_COUNT;
  S.cycle = Math.min(Math.floor(cyc), GAP_COUNT - 1);
  S.cyclePhase = cyc >= GAP_COUNT ? 1 : cyc - Math.floor(cyc);
  S.gapsFilled = cyc;
  S.robot = smooth(2.12, 2.3, view);

  // Placeholder acts.
  S.city = smooth(2.95, 3.35, view);
  S.night = smooth(3.85, 4.15, view) * (1 - smooth(4.85, 5.05, view));
  S.cloud = smooth(4.85, 5.1, view) * (1 - smooth(6.9, 7.0, view));

  // Sun: 07:30 → 18:00 across 01–04.
  const sunT = invLerp(1, 5, view);
  S.sunHour = view < 1 ? 10 : lerp(8.5, 18, sunT);
  if (view >= 6.97) S.sunHour = 10.5;
  S.sunVisible = view >= 1.02 && view < 5;

  // Camera.
  sampleCamera(view);

  // Background theme with soft blends near act boundaries.
  const idx = Math.min(Math.floor(view), ACTS.length - 1);
  const local = view - idx;
  const cur = ACTS[idx];
  const next = ACTS[Math.min(idx + 1, ACTS.length - 1)];
  colA.set(actColor(cur.id));
  colB.set(actColor(next.id));
  const blend = next.id === "index" ? 0 : smooth(0.82, 1, local);
  S.bg.copy(colA).lerp(colB, blend);
  S.dark = clamp((1 - S.bg.getHSL({ h: 0, s: 0, l: 0 }).l) * 1.4 - 0.2);

  // Scale bar.
  let scale = "1:100";
  if (view >= 1) scale = d < 0.3 ? "1:100" : "1:50";
  if (view >= 2) scale = scaleLabel(1 / S.siteS);
  if (view >= 2.95) {
    const pull = smooth(2.95, 3.6, view);
    scale = scaleLabel(Math.pow(5000, pull));
  }
  if (view >= 4) scale = "1:5000";
  if (view >= 5) scale = S.a.reconstruct < 0.5 ? "1:1 RECON" : "×10,000 SCENES";
  if (view >= 6) scale = "1:1";
  if (view >= 7) scale = "1:100";
  S.scaleText = scale;

  // HUD tags (English, never translated).
  const tags: string[] = [];
  if (view >= 2.05 && view < 3) {
    tags.push("NANJING 2020", "w/ RoboticPlus.AI");
    const g = S.gapsFilled;
    const n = Math.round(g);
    if (n >= 1 && Math.abs(g - n) < 0.1) tags.push(`NODE ${String(46 + n).padStart(3, "0")}`);
  } else if (view >= 3 && view < 4) tags.push("URBAN DATA", "SCENE IN PROGRESS");
  else if (view >= 4 && view < 5) tags.push("DEEPARCH", "SCENE IN PROGRESS");
  else if (view >= 5 && view < 6) tags.push(S.a.reconstruct < 0.5 ? "3DGS" : "PCG", "SCENE IN PROGRESS");
  else if (view >= 6 && view < 7) tags.push("VLA", "SCENE IN PROGRESS");
  S.tags = tags;

  // Veil for the cut into the index stage (placeholder acts only).
  const cutVeil = bump(6.86, 6.97, 7.0, 7.1, view);
  S.veil = Math.max(S.veil, cutVeil);
}

/** Frame-rate independent camera smoothing, used by the rig. */
export function dampFactor(dt: number, reduced: boolean) {
  return reduced ? 1 : damp(14, dt);
}

export { easeInOutCubic };
