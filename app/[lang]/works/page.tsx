import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/lib/i18n";
import { getWorks, toMeta } from "@/lib/works";
import { WorksList } from "@/components/works/WorksList";
import { Footer } from "@/components/chrome/Footer";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: getDict(lang).works.title,
    alternates: { languages: { en: "/en/works/", "zh-CN": "/zh/works/" } },
  };
}

export default async function WorksPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const works = getWorks(lang).map(toMeta);
  return (
    <>
      <main className="xs-page">
        <WorksList works={works} />
      </main>
      <Footer />
    </>
  );
}
