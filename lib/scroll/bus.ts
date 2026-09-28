import type { ActId } from "@/lib/story";
import { ACTS } from "@/lib/story";

export interface ActRange {
  start: number;
  end: number;
}

/**
 * Single per-frame snapshot of scroll + time. Written once per frame by the
 * driver (before DOM listeners and before R3F renders), read everywhere else.
 */
export interface ScrollBus {
  y: number;
  limit: number;
  velocity: number;
  /** 0–1 over the whole story. */
  progress: number;
  /** 0–1 local progress of each act. */
  acts: Record<ActId, number>;
  /** Continuous story position: act index + local progress (e.g. 1.5 = middle of design). */
  cursor: number;
  active: ActId;
  /** Seconds. Virtual in capture mode. */
  time: number;
  delta: number;
  frame: number;
  reduced: boolean;
  mobile: boolean;
  pointer: { x: number; y: number };
}

const zeroActs = Object.fromEntries(ACTS.map((a) => [a.id, 0])) as Record<ActId, number>;

export const bus: ScrollBus = {
  y: 0,
  limit: 1,
  velocity: 0,
  progress: 0,
  acts: { ...zeroActs },
  cursor: 0,
  active: "prologue",
  time: 0,
  delta: 0,
  frame: 0,
  reduced: false,
  mobile: false,
  pointer: { x: 0, y: 0 },
};

export const ranges: Partial<Record<ActId, ActRange>> = {};

type Listener = (b: ScrollBus) => void;
const listeners = new Set<Listener>();
let deriver: Listener | null = null;

/** Runs before every listener, so derived scene state is ready for DOM and WebGL alike. */
export function setDeriver(fn: Listener) {
  deriver = fn;
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function writeFrame(y: number, limit: number, velocity: number, time: number) {
  bus.delta = Math.min(Math.max(time - bus.time, 0), 0.1);
  bus.time = time;
  bus.frame++;
  bus.y = y;
  bus.limit = Math.max(limit, 1);
  bus.velocity = velocity;
  bus.progress = clamp01(y / bus.limit);

  let cursor = 0;
  let active: ActId = "prologue";
  for (let i = 0; i < ACTS.length; i++) {
    const id = ACTS[i].id;
    const r = ranges[id];
    const p = r ? clamp01((y - r.start) / Math.max(r.end - r.start, 1)) : 0;
    bus.acts[id] = p;
    if (r && y >= r.start) {
      cursor = i + p;
      active = id;
    }
  }
  bus.cursor = cursor;
  bus.active = active;

  deriver?.(bus);
  listeners.forEach((fn) => fn(bus));
}
