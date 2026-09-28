"use client";

import { useEffect, useRef } from "react";
import { ACTS } from "@/lib/story";
import { subscribe } from "@/lib/scroll/bus";
import { S } from "@/lib/director/state";
import { scrambleTo } from "@/lib/scramble";
import { scrollToY } from "@/lib/scroll/driver";
import { ranges } from "@/lib/scroll/bus";

const CHAPTERS = ACTS.filter((a) => a.tag && a.id !== "index");

function hhmm(hour: number) {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60 / 5) * 5;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Language-independent drawing-sheet HUD. Written imperatively once per frame. */
export function Hud() {
  const root = useRef<HTMLDivElement>(null);
  const scale = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const sun = useRef<HTMLSpanElement>(null);
  const sunWrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLSpanElement>(null);
  const tags = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const last = { scale: "", sun: "", stage: "", tags: "", active: "", dark: -1, sunOn: false, bar: -1 };
    return subscribe(() => {
      if (scale.current && S.scaleText !== last.scale) {
        const jumping = last.scale !== "" && S.view > 1.98 && S.view < 3.7;
        if (jumping) scale.current.textContent = S.scaleText;
        else scrambleTo(scale.current, S.scaleText, 300);
        last.scale = S.scaleText;
        const n = Number(S.scaleText.split(":")[1]);
        const w = Number.isFinite(n) ? 24 + 56 * (1 - Math.min(Math.log10(n) / 3.7, 1)) : 40;
        if (bar.current && Math.abs(w - last.bar) > 0.5) {
          bar.current.style.width = `${w}px`;
          last.bar = w;
        }
      }
      const t = hhmm(S.sunHour);
      if (sun.current && t !== last.sun) {
        sun.current.textContent = t;
        last.sun = t;
      }
      if (sunWrap.current && S.sunVisible !== last.sunOn) {
        sunWrap.current.classList.toggle("is-on", S.sunVisible);
        last.sunOn = S.sunVisible;
      }
      if (stage.current && S.stageLabel !== last.stage) {
        scrambleTo(stage.current, S.stageLabel, 360);
        last.stage = S.stageLabel;
      }
      const tg = S.tags.join(" · ");
      if (tags.current && tg !== last.tags) {
        scrambleTo(tags.current, tg, 420);
        last.tags = tg;
      }
      const idx = Math.floor(S.view);
      const active = ACTS[Math.min(idx, ACTS.length - 1)]?.id ?? "";
      if (nav.current && active !== last.active) {
        nav.current.querySelectorAll("li").forEach((li) => li.classList.toggle("is-active", li.dataset.id === active));
        last.active = active;
      }
      const dark = S.dark > 0.5 ? 1 : 0;
      if (dark !== last.dark) {
        document.documentElement.classList.toggle("is-dark", dark === 1);
        last.dark = dark;
      }
      if (root.current) root.current.classList.toggle("is-hidden", S.view >= 7.02);
    });
  }, []);

  useEffect(() => () => document.documentElement.classList.remove("is-dark"), []);

  const go = (id: string) => {
    const r = ranges[id as keyof typeof ranges];
    if (r) scrollToY(r.start + (r.end - r.start) * 0.08);
  };

  return (
    <div ref={root} className="xs-hud" aria-hidden>
      <ol ref={nav} className="xs-chapters">
        {CHAPTERS.map((a) => (
          <li key={a.id} data-id={a.id}>
            <button tabIndex={-1} onClick={() => go(a.id)}>
              <span className="n">{a.no}</span> <span className="t">{a.tag}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="xs-hud-bl">
        <div className="xs-scalebar">
          <span ref={bar} className="xs-scalebar-bar" />
          <span ref={scale} className="xs-scalebar-text">1:100</span>
        </div>
        <div className="xs-coords">32.06°N 118.80°E</div>
      </div>
      <div className="xs-hud-br">
        <span ref={stage} className="xs-stage" />
        <div ref={tags} className="xs-tags" />
        <div ref={sunWrap} className="xs-sun">
          <i aria-hidden /> <span ref={sun}>10:00</span>
        </div>
      </div>
    </div>
  );
}
