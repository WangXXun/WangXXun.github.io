// Deterministic frame capture of the scroll story (headless Chrome).
//
//   node scripts/capture.mjs shots  --url http://localhost:3000/en/ --at 0.2,1.5,2.4 --out capture/shots
//   node scripts/capture.mjs video  --url http://localhost:3000/en/ --from 0 --to 3.2 --seconds 40 --fps 30 --out capture/frames
//
// The page is opened with ?capture, which freezes real time and lets this
// script set virtual time + scroll per frame, so slow software rendering
// still yields a smooth video.
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const mode = args[0];
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : d;
};
const url = opt("url", "http://localhost:3000/en/");
const out = opt("out", "capture/out");
const width = Number(opt("w", 1440));
const height = Number(opt("h", 900));
const quality = opt("q", "high");
const chrome = opt("chrome", process.env.CHROME_PATH || "/usr/local/bin/google-chrome");

fs.mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: [
    "--no-sandbox",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--ignore-gpu-blocklist",
    `--window-size=${width},${height}`,
    "--hide-scrollbars",
  ],
  defaultViewport: { width, height, deviceScaleFactor: 1 },
  protocolTimeout: 600000,
});
const page = await browser.newPage();
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warn") console.log("[page]", m.type(), m.text());
});
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

const sep = url.includes("?") ? "&" : "?";
await page.goto(`${url}${sep}capture&q=${quality}${opt("extra", "")}`, { waitUntil: "networkidle0", timeout: 120000 });
await page.waitForFunction(() => window.__studio && document.querySelector("canvas"), { timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));

const frame = () =>
  page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))),
  );

async function setState(t, cursor) {
  await page.evaluate(
    (t, c) => {
      window.__studio.setTime(t);
      window.__studio.setScroll(window.__studio.yFor(c));
    },
    t,
    cursor,
  );
  await frame();
}

// Let the prologue intro finish in virtual time.
for (let t = 0; t <= 3; t += 0.25) await setState(t, 0);

if (mode === "shots") {
  const at = opt("at", "0").split(",").map(Number);
  let t = 3;
  for (const c of at) {
    // Walk towards the target so damped values settle.
    for (let k = 0; k < Number(opt("settle", 12)); k++) {
      t += 1 / 30;
      await setState(t, c);
    }
    const file = path.join(out, `${opt("prefix", "shot")}-${c.toFixed(2)}.png`);
    await page.screenshot({ path: file });
    console.log("saved", file);
  }
} else if (mode === "video") {
  const from = Number(opt("from", 0));
  const to = Number(opt("to", 3));
  const seconds = Number(opt("seconds", 30));
  const fps = Number(opt("fps", 30));
  const hold = Number(opt("hold", 1.2));
  const n = Math.round(seconds * fps);
  const holdN = Math.round(hold * fps);
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  // Cursor schedule: short hold on the prologue, eased scroll, hold at the end.
  const cursorAt = (i) => {
    if (i < holdN) return from;
    if (i >= n - holdN) return to;
    const u = (i - holdN) / (n - 2 * holdN);
    // Mostly linear with soft ends, like a steady trackpad scroll.
    const s = 0.15 * ease(u) + 0.85 * u;
    return from + (to - from) * s;
  };
  let t = 3;
  const started = Date.now();
  for (let i = 0; i < n; i++) {
    t += 1 / fps;
    await setState(t, cursorAt(i));
    const file = path.join(out, `f${String(i).padStart(5, "0")}.png`);
    await page.screenshot({ path: file });
    if (i % 30 === 0) console.log(`frame ${i}/${n}  cursor=${cursorAt(i).toFixed(3)}  ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
}

await browser.close();
