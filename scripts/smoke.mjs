// Smoke test against a running static server (npm run build && npm start).
//   node scripts/smoke.mjs [--url http://localhost:3000]
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const base = (args.includes("--url") ? args[args.indexOf("--url") + 1] : "http://localhost:3000").replace(/\/$/, "");
const chrome = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  defaultViewport: { width: 1200, height: 750 },
});
const failures = [];
const check = (ok, msg) => {
  console.log(`${ok ? "✓" : "✗"} ${msg}`);
  if (!ok) failures.push(msg);
};

const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

for (const path of ["/en/", "/zh/", "/en/works/", "/zh/works/", "/en/about/", "/zh/about/", "/en/works/deeparch/", "/zh/works/urban-data/"]) {
  const res = await page.goto(base + path, { waitUntil: "domcontentloaded" });
  check(res?.status() === 200, `${path} → ${res?.status()}`);
}
await page.goto(base + "/zh/works/urban-data/", { waitUntil: "domcontentloaded" });
check(await page.$eval(".xs-fallback", (el) => el.textContent?.length > 0).catch(() => false), "missing zh falls back with notice");

// Root redirect honours the saved language.
await page.goto(base + "/en/", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.setItem("xs-lang", "zh"));
await page.goto(base + "/", { waitUntil: "networkidle0" });
check(page.url().endsWith("/zh/"), `"/" redirects to saved zh (${page.url()})`);
await page.evaluate(() => localStorage.removeItem("xs-lang"));
await page.goto(base + "/", { waitUntil: "networkidle0" });
check(page.url().endsWith("/en/"), `"/" defaults to /en (${page.url()})`);

// In-place language switch on the home story.
await page.goto(base + "/en/", { waitUntil: "networkidle0" });
await page.waitForSelector("canvas", { timeout: 60000 });
await page.evaluate(() => {
  window.__canvasMarker = document.querySelector("canvas");
  window.scrollTo(0, Math.round(document.documentElement.scrollHeight * 0.14));
});
await new Promise((r) => setTimeout(r, 2500));
const before = await page.evaluate(() => window.scrollY);
const titleBefore = await page.$eval('[data-title="design"] .xs-act-mask', (el) => el.textContent);
await page.click('.xs-lang button[lang="zh-CN"]');
await new Promise((r) => setTimeout(r, 1500));
const after = await page.evaluate(() => ({
  y: window.scrollY,
  path: location.pathname,
  lang: document.documentElement.lang,
  sameCanvas: window.__canvasMarker === document.querySelector("canvas"),
  title: document.querySelector('[data-title="design"] .xs-act-mask')?.textContent,
}));
check(after.path === "/zh/", `URL switched to /zh/ (${after.path})`);
check(after.lang === "zh-CN", `<html lang> = ${after.lang}`);
check(Math.abs(after.y - before) < 2, `scroll kept (${before} → ${after.y})`);
check(after.sameCanvas, "WebGL canvas not remounted");
check(titleBefore === "Design" && after.title === "设计", `title decoded (${titleBefore} → ${after.title})`);

// Reduced motion path boots without errors.
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page.goto(base + "/en/", { waitUntil: "networkidle0" });
await page.waitForSelector("canvas", { timeout: 60000 });
await page.evaluate(() => window.scrollTo(0, 2000));
await new Promise((r) => setTimeout(r, 1500));
check(!(await page.evaluate(() => document.documentElement.classList.contains("lenis"))), "reduced motion: Lenis disabled");

check(errors.length === 0, `no page errors${errors.length ? ": " + errors.join(" | ") : ""}`);
await browser.close();
if (failures.length) {
  console.error(`${failures.length} check(s) failed`);
  process.exit(1);
}
