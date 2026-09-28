"use client";

import Link from "next/link";
import { useLang } from "@/components/providers/LangProvider";
import { EmailCopy } from "@/components/ui/EmailCopy";
import { Scramble } from "@/components/ui/Scramble";
import type { WorkMeta } from "@/lib/works-shared";

export function IndexSection({ vh, works }: { vh: number; works: WorkMeta[] }) {
  const { lang, dict } = useLang();
  return (
    <section id="index" className="xs-act xs-index" style={{ "--act-vh": vh } as React.CSSProperties}>
      <div className="xs-index-inner">
        <h2 className="xs-index-title">
          <span className="xs-act-no">INDEX</span>
          <Scramble text={dict.acts.index.title} />
        </h2>
        <ul className="xs-worklist" aria-label={dict.index.selected}>
          {works.map((w, i) => (
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
        <Link href={`/${lang}/works/`} className="xs-all">
          <Scramble text={dict.index.all} />
        </Link>
        <div className="xs-index-contact">
          <EmailCopy large />
        </div>
        <footer className="xs-index-foot">
          <span>{dict.footer.copyright}</span>
          <span className="xs-mono">{dict.illustrative}</span>
        </footer>
      </div>
    </section>
  );
}
