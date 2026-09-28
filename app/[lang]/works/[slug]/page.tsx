import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { getDict, isLocale, locales } from "@/lib/i18n";
import { getWork, getWorks, getWorkSlugs } from "@/lib/works";
import { Footer } from "@/components/chrome/Footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => getWorkSlugs().map((slug) => ({ lang, slug })));
}

type Params = Promise<{ lang: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const w = getWork(slug, lang);
  return {
    title: w?.title,
    alternates: { languages: { en: `/en/works/${slug}/`, "zh-CN": `/zh/works/${slug}/` } },
  };
}

export default async function WorkPage({ params }: { params: Params }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const work = getWork(slug, lang);
  if (!work) notFound();
  const dict = getDict(lang);
  const all = getWorks(lang);
  const i = all.findIndex((w) => w.slug === slug);
  const prev = all[(i - 1 + all.length) % all.length];
  const next = all[(i + 1) % all.length];
  const { content } = work.body.trim()
    ? await compileMDX({ source: work.body })
    : { content: null };

  const meta: [string, string | undefined][] = [
    ["YEAR", work.year],
    ["CATEGORY", dict.works.categories[work.category]],
    ["PLACE", work.place],
    ["ROLE", work.role],
    ["WITH", work.collaborators],
  ];

  return (
    <>
      <main className="xs-page xs-work">
        <Link href={`/${lang}/works/`} className="xs-back">
          {dict.works.back}
        </Link>
        {work.fallback && (
          <p className="xs-fallback" lang={lang === "zh" ? "zh-CN" : "en"}>
            {dict.works.fallbackNotice}
          </p>
        )}
        <h1 className="xs-page-title">{work.title}</h1>
        <dl className="xs-meta">
          {meta
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
        {content ? <article className="xs-prose">{content}</article> : <div className="xs-media-slot" aria-hidden />}
        <nav className="xs-prevnext">
          <Link href={`/${lang}/works/${prev.slug}/`}>
            ← {dict.works.prev} <span>{prev.title}</span>
          </Link>
          <Link href={`/${lang}/works/${next.slug}/`}>
            <span>{next.title}</span> {dict.works.next} →
          </Link>
        </nav>
      </main>
      <Footer />
    </>
  );
}
