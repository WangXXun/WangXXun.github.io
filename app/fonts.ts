import { Inter_Tight, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";

export const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

/** Only referenced by `html[lang^="zh"]` styles, so browsers fetch it on /zh only. */
export const zhSans = Noto_Sans_SC({
  weight: ["300", "400", "500"],
  variable: "--font-zh",
  display: "swap",
  preload: false,
});
