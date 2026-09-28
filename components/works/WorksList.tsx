"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import { CATEGORIES, type Category, type WorkMeta } from "@/lib/works-shared";

/** p5aholic-style plain text index, filterable by the six categories. */
export function WorksList({ works }: { works: WorkMeta[] }) {
  const { lang, dict } = useLang();
  const [filter, setFilter] = useState<Category | "all">("all");
  const shown = works.filter((w) => filter === "all" || w.category === filter);

  return (
    <>
      <h1 className="xs-page-title">{dict.works.title}</h1>
      <div className="xs-filters" role="toolbar" aria-label="Filter">
        <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
          {dict.works.all}
          <sup>{works.length}</sup>
        </button>
        {CATEGORIES.map((c) => {
          const n = works.filter((w) => w.category === c).length;
          return (
            <button key={c} aria-pressed={filter === c} onClick={() => setFilter(c)} disabled={n === 0}>
              {dict.works.categories[c]}
              <sup>{n}</sup>
            </button>
          );
        })}
      </div>
      {shown.length === 0 ? (
        <p className="xs-empty">{dict.works.empty}</p>
      ) : (
        <ul className="xs-worklist is-page">
          {shown.map((w, i) => (
            <li key={w.slug}>
              <Link href={`/${lang}/works/${w.slug}/`}>
                <span className="xs-worklist-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="xs-worklist-title">{w.title}</span>
                <span className="xs-worklist-meta">
                  {[w.year, dict.works.categories[w.category]].filter(Boolean).join(" / ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
