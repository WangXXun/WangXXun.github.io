import type { Color } from "three";

/** Set while the post-processing chain (which tone-maps the background too) is active. */
export const bgTone = { compensate: false };

const START = 0.76;
const D = 1 - START;

/**
 * Pre-distort a linear background colour so that Khronos PBR Neutral tone
 * mapping maps it back to (approximately) itself. Keeps the paper exact.
 */
export function preToneMap(c: Color) {
  const peak = Math.max(c.r, c.g, c.b);
  if (peak <= START) return c;
  const target = Math.min(peak, 0.995);
  const p = START - D + (D * D) / (1 - target);
  return c.multiplyScalar(p / peak);
}
