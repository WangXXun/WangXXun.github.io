const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/:·—+×#";

const running = new WeakMap<HTMLElement, number>();

function prefersReduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Decode `el` from its current text to `next` with random glyphs (≤ duration ms). */
export function scrambleTo(el: HTMLElement, next: string, duration = 380) {
  const from = el.textContent ?? "";
  if (from === next) return;
  const prev = running.get(el);
  if (prev) cancelAnimationFrame(prev);
  if (prefersReduced() || duration <= 0) {
    el.textContent = next;
    return;
  }
  const len = Math.max(from.length, next.length);
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    let out = "";
    for (let i = 0; i < len; i++) {
      const settle = (i / len) * 0.6 + 0.4;
      if (t >= settle) out += next[i] ?? "";
      else if (t > settle - 0.5) {
        const c = next[i] ?? from[i] ?? "";
        out += c === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      } else out += from[i] ?? "";
    }
    el.textContent = out;
    if (t < 1) running.set(el, requestAnimationFrame(step));
    else {
      el.textContent = next;
      running.delete(el);
    }
  };
  running.set(el, requestAnimationFrame(step));
}
