import { isLocale, locales } from "@/lib/i18n";
import { getWorks, toMeta, type WorkMeta } from "@/lib/works";
import { Home } from "@/components/home/Home";
import { notFound } from "next/navigation";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const featured = Object.fromEntries(
    locales.map((l) => [l, getWorks(l).filter((w) => w.featured).map(toMeta)]),
  ) as Record<(typeof locales)[number], WorkMeta[]>;
  return <Home featured={featured} />;
}
