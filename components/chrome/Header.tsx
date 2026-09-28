"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import { Scramble } from "@/components/ui/Scramble";
import { scrollToElement } from "@/lib/scroll/driver";

export function Header() {
  const { lang, dict, setLang } = useLang();
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const isHome = /^\/(en|zh)\/?$/.test(pathname);

  const skip = () => {
    const el = document.getElementById("index");
    if (el) scrollToElement(el);
    setOpen(false);
  };

  return (
    <header className={`xs-header${open ? " is-open" : ""}`}>
      <Link href={`/${lang}/`} className="xs-logo" onClick={() => setOpen(false)}>
        xun&apos;s studio
      </Link>
      <button className="xs-menu-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Scramble text={open ? dict.nav.close : dict.nav.menu} />
      </button>
      <nav className="xs-nav" aria-label="Primary">
        <Link href={`/${lang}/works/`} onClick={() => setOpen(false)} aria-current={pathname.includes("/works") ? "page" : undefined}>
          <Scramble text={dict.nav.works} />
        </Link>
        <Link href={`/${lang}/about/`} onClick={() => setOpen(false)} aria-current={pathname.includes("/about") ? "page" : undefined}>
          <Scramble text={dict.nav.about} />
        </Link>
        <span className="xs-lang" role="group" aria-label="Language">
          <button aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">
            EN
          </button>
          <span aria-hidden>/</span>
          <button aria-pressed={lang === "zh"} onClick={() => setLang("zh")} lang="zh-CN">
            中
          </button>
        </span>
        {isHome && (
          <button className="xs-skip" onClick={skip}>
            <Scramble text={dict.nav.skip} /> ↓
          </button>
        )}
      </nav>
    </header>
  );
}
