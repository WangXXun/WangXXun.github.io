import type { Metadata } from "next";
import { LOCALE_STORAGE_KEY } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "xun's studio",
  description: "I used to design and build space. Now I teach machines to understand it.",
};

const script = `(function(){try{var l=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});location.replace((l==="zh"?"/zh/":"/en/")+location.search+location.hash)}catch(e){location.replace("/en/")}})();`;

export default function RootPage() {
  return (
    <main className="redirect">
      <script dangerouslySetInnerHTML={{ __html: script }} />
      <noscript>
        {/* Plain links: this page lives outside the [lang] root layout. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/en/">xun&apos;s studio — English</a> ·{" "}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/zh/">中文</a>
      </noscript>
    </main>
  );
}
