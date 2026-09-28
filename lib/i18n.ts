import en from "@/content/i18n/en.json";
import zh from "@/content/i18n/zh.json";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type Dict = typeof en;

const dicts: Record<Locale, Dict> = { en, zh };

export const EMAIL = "wangxun_arch@163.com";
export const LOCALE_STORAGE_KEY = "xs-lang";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDict(lang: Locale): Dict {
  return dicts[lang];
}

export function otherLocale(lang: Locale): Locale {
  return lang === "en" ? "zh" : "en";
}

/** Swap the leading `/en` or `/zh` segment of a pathname. */
export function swapLocaleInPath(pathname: string, to: Locale): string {
  const parts = pathname.split("/");
  if (parts.length > 1 && isLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}/`;
}
