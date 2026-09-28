"use client";

import { EmailCopy } from "@/components/ui/EmailCopy";
import { useLang } from "@/components/providers/LangProvider";

export function Footer() {
  const { dict } = useLang();
  return (
    <footer className="xs-footer">
      <EmailCopy />
      <span className="xs-footer-copy">{dict.footer.copyright}</span>
    </footer>
  );
}
