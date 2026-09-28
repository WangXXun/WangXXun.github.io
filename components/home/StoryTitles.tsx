"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ACTS, type ActId } from "@/lib/story";
import { subscribe, bus } from "@/lib/scroll/bus";
import { S } from "@/lib/director/state";
import { useLang } from "@/components/providers/LangProvider";
import { Scramble } from "@/components/ui/Scramble";

const TITLED = ACTS.filter((a) => a.id !== "prologue" && a.id !== "index");

/**
 * One title per act, in a fixed DOM layer. Each title owns a paused GSAP
 * timeline whose progress is set from the same frame snapshot the WebGL
 * scene renders with — no second scroll listener, no one-frame lag.
 */
export function StoryTitles() {
  const { dict, lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = bus.reduced;
    const tls = new Map<ActId, gsap.core.Timeline>();
    el.querySelectorAll<HTMLElement>("[data-title]").forEach((node) => {
      const id = node.dataset.title as ActId;
      const inner = node.querySelectorAll<HTMLElement>("[data-reveal]");
      const tl = gsap.timeline({ paused: true });
      if (reduced) {
        tl.fromTo(node, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04, ease: "none" }, 0.03)
          .to(node, { autoAlpha: 0, duration: 0.04, ease: "none" }, 0.9);
      } else {
        tl.set(node, { autoAlpha: 1 }, 0)
          .fromTo(inner, { yPercent: 118 }, { yPercent: 0, duration: 0.1, ease: "power3.out", stagger: 0.015 }, 0.03)
          .to(inner, { yPercent: -118, duration: 0.08, ease: "power3.in", stagger: 0.01 }, 0.88)
          .set(node, { autoAlpha: 0 }, 0.999);
      }
      tl.set({}, {}, 1);
      tls.set(id, tl);
      gsap.set(node, { autoAlpha: 0 });
    });

    let lastHero = -1;
    const unsub = subscribe(() => {
      tls.forEach((tl, id) => {
        const p = S.a[id];
        const on = p > 0 && p < 1;
        if (!on && tl.progress() !== (p >= 1 ? 1 : 0)) tl.progress(p >= 1 ? 1 : 0);
        else if (on) tl.progress(p);
      });
      if (hero.current) {
        const h = Math.min(S.view / 0.35, 1);
        const o = Math.round((1 - h) * Math.min(1, S.intro * 1.4) * 1000) / 1000;
        if (o !== lastHero) {
          lastHero = o;
          hero.current.style.opacity = String(o);
          hero.current.style.transform = `translate3d(0, ${-h * 40}px, 0)`;
          hero.current.style.visibility = o <= 0 ? "hidden" : "visible";
        }
      }
    });
    return () => {
      unsub();
      tls.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={root} className="xs-titles">
      <div ref={hero} className="xs-hero-title">
        <h1>
          <span data-reveal>xun&apos;s studio</span>
        </h1>
        <span className="xs-scroll-cue">
          <Scramble text={dict.prologue.scroll} />
          <i aria-hidden />
        </span>
      </div>
      {TITLED.map((a) => (
        <h2 key={a.id} className="xs-act-title" data-title={a.id}>
          <span className="xs-act-no">
            <span data-reveal>{a.no}</span>
          </span>
          <span className="xs-act-mask">
            <span data-reveal>
              <Scramble text={dict.acts[a.id as keyof typeof dict.acts].title} />
            </span>
          </span>
          <span className={`xs-act-tag${lang === "zh" ? " is-on" : ""}`}>
            <span data-reveal>{a.tag}</span>
          </span>
        </h2>
      ))}
    </div>
  );
}
