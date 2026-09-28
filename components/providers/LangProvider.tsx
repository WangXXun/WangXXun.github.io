"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type Dict,
  type Locale,
  getDict,
  LOCALE_STORAGE_KEY,
  swapLocaleInPath,
} from "@/lib/i18n";

interface LangContextValue {
  lang: Locale;
  dict: Dict;
  /** Switch language. In-place (no navigation) when `inPlace`, otherwise route. */
  setLang: (to: Locale) => void;
  /** Pages whose whole content is in the client dictionary can switch in place. */
  registerInPlace: () => () => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ initial, children }: { initial: Locale; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Locale>(initial);
  const [inPlace, setInPlace] = useState(0);
  const router = useRouter();

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setLangState(initial);
  }

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const setLang = useCallback(
    (to: Locale) => {
      if (to === lang) return;
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, to);
      } catch {}
      const next = swapLocaleInPath(window.location.pathname, to) + window.location.search + window.location.hash;
      if (inPlace > 0) {
        window.history.replaceState(window.history.state, "", next);
        setLangState(to);
      } else {
        router.replace(next, { scroll: false });
      }
    },
    [lang, inPlace, router],
  );

  const registerInPlace = useCallback(() => {
    setInPlace((n) => n + 1);
    return () => setInPlace((n) => n - 1);
  }, []);

  const value = useMemo(
    () => ({ lang, dict: getDict(lang), setLang, registerInPlace }),
    [lang, setLang, registerInPlace],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
