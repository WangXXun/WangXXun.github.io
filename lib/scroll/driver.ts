"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { bus, ranges, writeFrame } from "./bus";
import { ACTS } from "@/lib/story";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let rafId = 0;
let external = false;
let refs = 0;

/** Capture mode: time and scroll are set explicitly by an automation script. */
const capture = {
  enabled: false,
  time: 0,
};

function nowSeconds(ms: number) {
  return capture.enabled ? capture.time : ms / 1000;
}

/**
 * Advance one frame. Lenis → ScrollTrigger → bus → DOM listeners, all in
 * the same call. When a Canvas is mounted this runs from R3F's addEffect,
 * i.e. immediately before the WebGL render of the same frame.
 */
export function tick(ms: number) {
  if (lenis && !capture.enabled) lenis.raf(ms);
  const y = lenis && !capture.enabled ? lenis.animatedScroll : window.scrollY;
  const limit = lenis ? lenis.limit : document.documentElement.scrollHeight - window.innerHeight;
  const velocity = lenis && !capture.enabled ? lenis.velocity : 0;
  writeFrame(y, limit, velocity, nowSeconds(ms));
}

function loop(ms: number) {
  tick(ms);
  rafId = requestAnimationFrame(loop);
}

/** R3F takes over the frame loop while a Canvas is mounted. */
export function setExternalDriver(on: boolean) {
  external = on;
  cancelAnimationFrame(rafId);
  if (!on && refs > 0) rafId = requestAnimationFrame(loop);
}

export function initScroll() {
  refs++;
  if (refs > 1) return;

  const params = new URLSearchParams(window.location.search);
  capture.enabled = params.has("capture");
  bus.reduced =
    params.get("motion") === "reduce" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  bus.mobile = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;

  if (!bus.reduced && !capture.enabled) {
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.9,
    });
    lenis.on("scroll", ScrollTrigger.update);
  }
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const onPointer = (e: PointerEvent) => {
    bus.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    bus.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  if (capture.enabled) {
    (window as unknown as { __studio: unknown }).__studio = {
      setTime(t: number) {
        capture.time = t;
      },
      setScroll(y: number) {
        window.scrollTo(0, y);
      },
      limit() {
        return document.documentElement.scrollHeight - window.innerHeight;
      },
      /** Scroll offset for a story cursor (act index + local progress). */
      yFor(cursor: number) {
        const i = Math.floor(cursor);
        const act = ACTS[Math.min(i, ACTS.length - 1)];
        const r = ranges[act.id];
        if (!r) return 0;
        return r.start + (r.end - r.start) * Math.min(cursor - i, 1);
      },
      bus,
    };
  }

  if (!external) rafId = requestAnimationFrame(loop);
}

export function destroyScroll() {
  refs = Math.max(refs - 1, 0);
  if (refs > 0) return;
  cancelAnimationFrame(rafId);
  lenis?.destroy();
  lenis = null;
}

export function scrollToY(y: number, immediate = false) {
  if (lenis) lenis.scrollTo(y, { immediate, duration: immediate ? 0 : 1.6 });
  else window.scrollTo({ top: y, behavior: immediate || bus.reduced ? "auto" : "smooth" });
}

export function scrollToElement(el: HTMLElement) {
  const y = el.getBoundingClientRect().top + window.scrollY;
  scrollToY(y);
}

export function isCapture() {
  return capture.enabled;
}
