import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { Footer } from "@/components/chrome/Footer";
import { EmailCopy } from "@/components/ui/EmailCopy";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: getDict(lang).about.title,
    alternates: { languages: { en: "/en/about/", "zh-CN": "/zh/about/" } },
  };
}

const SCALES = ["1:50", "1:1", "1:5000", "1:5000", "1:1", "1:1"];

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  return (
    <>
      <main className="xs-page xs-about">
        <h1 className="xs-page-title">{dict.about.title}</h1>
        <p className="xs-lead">{dict.about.lead}</p>
        <ol className="xs-timeline">
          {dict.about.timeline.map((t, i) => (
            <li key={t.tag}>
              <span className="xs-timeline-scale">{SCALES[i]}</span>
              <span className="xs-timeline-tag">{t.tag}</span>
              <span className="xs-timeline-text">{t.text}</span>
            </li>
          ))}
        </ol>
        <section className="xs-about-contact">
          <h2 className="xs-mono">{dict.about.contact}</h2>
          <EmailCopy large />
        </section>
      </main>
      <Footer />
    </>
  );
}
