import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { display, mono, zhSans } from "../fonts";
import { getDict, isLocale, locales } from "@/lib/i18n";
import { LangProvider } from "@/components/providers/LangProvider";
import { Header } from "@/components/chrome/Header";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDict(lang);
  return {
    title: { default: dict.meta.title, template: `%s — ${dict.siteName}` },
    description: dict.meta.description,
    metadataBase: new URL("https://wangxxun.github.io"),
    icons: { icon: "/favicon.svg" },
    alternates: {
      canonical: `/${lang}/`,
      languages: { en: "/en/", "zh-CN": "/zh/", "x-default": "/en/" },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: dict.siteName,
      locale: lang === "zh" ? "zh_CN" : "en_US",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#F2F0EB",
  width: "device-width",
  initialScale: 1,
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang === "zh" ? "zh-CN" : "en"} className={`${display.variable} ${mono.variable} ${zhSans.variable}`}>
      <body>
        <LangProvider initial={lang}>
          <Header />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
