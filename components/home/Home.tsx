"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ACTS } from "@/lib/story";
import { ranges, setDeriver, subscribe } from "@/lib/scroll/bus";
import { destroyScroll, initScroll } from "@/lib/scroll/driver";
import { derive, S } from "@/lib/director/state";
import { useLang } from "@/components/providers/LangProvider";
import type { WorkMeta } from "@/lib/works-shared";
import type { Locale } from "@/lib/i18n";
import { StoryTitles } from "./StoryTitles";
import { Hud } from "./Hud";
import { IndexSection } from "./IndexSection";

const Experience = dynamic(() => import("@/components/three/Experience"), { ssr: false });

const noopSubscribe = () => () => {};

let webglSupport: boolean | undefined;
function hasWebGL() {
  if (webglSupport !== undefined) return webglSupport;
  webglSupport = detectWebGL();
  return webglSupport;
}

function detectWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function Veil() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!el) return;
    let last = -1;
    return subscribe(() => {
      const v = Math.round(S.veil * 100) / 100;
      if (v === last) return;
      last = v;
      el.style.opacity = String(v);
      el.style.backgroundColor = `#${S.bg.getHexString()}`;
    });
  }, [el]);
  return <div ref={setEl} className="xs-veil" aria-hidden />;
}

export function Home({ featured }: { featured: Record<Locale, WorkMeta[]> }) {
  const { lang, registerInPlace } = useLang();
  const webgl = useSyncExternalStore(noopSubscribe, hasWebGL, () => null);

  useEffect(() => registerInPlace(), [registerInPlace]);

  useEffect(() => {
    setDeriver(derive);
    initScroll();
    return () => destroyScroll();
  }, []);

  useLayoutEffect(() => {
    const triggers = ACTS.map((a, i) => {
      const el = document.getElementById(a.id);
      if (!el) return null;
      const last = i === ACTS.length - 1;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: last ? "bottom bottom" : "bottom top",
        onRefresh: (self) => {
          ranges[a.id] = { start: self.start, end: self.end };
        },
      });
      ranges[a.id] = { start: st.start, end: st.end };
      return st;
    });
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    return () => triggers.forEach((t) => t?.kill());
  }, []);

  return (
    <>
      {webgl && <Experience />}
      {webgl === false && (
        <div className="xs-nogl" aria-hidden>
          <div className="xs-nogl-block" />
        </div>
      )}
      <Veil />
      <StoryTitles />
      <Hud />
      <main className="xs-story">
        {ACTS.map((a) =>
          a.id === "index" ? (
            <IndexSection key={a.id} vh={a.vh} works={featured[lang]} />
          ) : (
            <section key={a.id} id={a.id} className="xs-act" style={{ "--act-vh": a.vh } as React.CSSProperties} />
          ),
        )}
      </main>
    </>
  );
}
