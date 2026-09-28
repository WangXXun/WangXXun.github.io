import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "./i18n";
import { CATEGORIES, type Category, type WorkMeta } from "./works-shared";

export { CATEGORIES, type Category, type WorkMeta };

export interface Work extends WorkMeta {
  body: string;
  /** Language actually served (falls back to the other one). */
  lang: Locale;
  fallback: boolean;
}

const ROOT = path.join(process.cwd(), "content", "works");

function readFile(slug: string, lang: Locale) {
  const file = path.join(ROOT, slug, `index.${lang}.mdx`);
  if (!fs.existsSync(file)) return null;
  return matter(fs.readFileSync(file, "utf8"));
}

export function getWorkSlugs(): string[] {
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

export function getWork(slug: string, lang: Locale): Work | null {
  const other: Locale = lang === "en" ? "zh" : "en";
  let parsed = readFile(slug, lang);
  let served = lang;
  if (!parsed) {
    parsed = readFile(slug, other);
    served = other;
  }
  if (!parsed) return null;
  const d = parsed.data as Record<string, unknown>;
  return {
    slug,
    title: String(d.title ?? slug),
    year: String(d.year ?? ""),
    category: (CATEGORIES as readonly string[]).includes(String(d.category)) ? (d.category as Category) : "design",
    role: d.role ? String(d.role) : undefined,
    place: d.place ? String(d.place) : undefined,
    collaborators: d.collaborators ? String(d.collaborators) : undefined,
    featured: Boolean(d.featured),
    order: Number(d.order ?? 99),
    cover: d.cover ? String(d.cover) : undefined,
    body: parsed.content,
    lang: served,
    fallback: served !== lang,
  };
}

export function getWorks(lang: Locale): Work[] {
  return getWorkSlugs()
    .map((s) => getWork(s, lang))
    .filter((w): w is Work => !!w)
    .sort((a, b) => a.order - b.order);
}

export function toMeta(w: Work): WorkMeta {
  const { body: _body, lang: _lang, fallback: _fallback, ...meta } = w;
  void _body;
  void _lang;
  void _fallback;
  return meta;
}
