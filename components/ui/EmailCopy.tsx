"use client";

import { useRef, useState } from "react";
import { EMAIL } from "@/lib/i18n";
import { useLang } from "@/components/providers/LangProvider";

export function EmailCopy({ large = false }: { large?: boolean }) {
  const { dict } = useLang();
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <span className={`xs-email${large ? " is-large" : ""}`}>
      <button type="button" onClick={copy} className="xs-email-copy" aria-live="polite">
        {EMAIL}
        <span className={`xs-email-state${copied ? " is-on" : ""}`}>{dict.index.copied}</span>
      </button>
      <a href={`mailto:${EMAIL}`} className="xs-email-mailto" aria-label={`mailto:${EMAIL}`}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M3 6.5h18v11H3z M3 7l9 6.5L21 7" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </a>
    </span>
  );
}
