import { Vector3 } from "three";

/** Room is the prologue block scaled up: a cube of side ROOM. */
export const ROOM = 3.6;
export const K0 = 1 / ROOM;
export const PROLOGUE_LIFT = 0.32;

export const TABLE = {
  x: 0.1,
  z: -1.12,
  w: 2.6,
  d: 0.9,
  top: 0.765,
  thick: 0.028,
};

/** Hero model on the table (room space). */
export const HERO_SIZE = 0.3;
export const HERO_POS = new Vector3(0.36, TABLE.top + HERO_SIZE / 2, -1.14);

/** Drawing sheet on the table (room space). */
export const SHEET = { x: -0.62, z: -1.08, w: 0.84, d: 0.594, rot: 0.06 };

/** 1:50 site model sits on the table where the hero stands. */
export const SITE_SCALE_0 = 1 / 50;
export const SITE_ORIGIN_0 = new Vector3(HERO_POS.x, TABLE.top + 0.0062, HERO_POS.z);
/** Site-local eye point held during the scale jump (metres at 1:1). */
export const JUMP_EYE = new Vector3(4.6, 1.7, 6.2);

/** Robot base and workbench (site space). */
export const ARM_BASE = new Vector3(1.6, 0, 4.6);
export const BENCH = new Vector3(2.75, 0.86, 3.7);
export const HUMAN = new Vector3(0.1, 0, 3.1);

/** Index stage lives far away; reached through a cut masked by a wipe. */
export const INDEX_ORIGIN = new Vector3(0, 0, -800);

export const WINDOW = { z0: -1.35, z1: 0.25, y0: 0.95, y1: 2.55 };
