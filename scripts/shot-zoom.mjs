// High-DPI clipped screenshot for detail inspection.
// usage: node scripts/shot-zoom.mjs <url> <out> <x> <y> <w> <h>
import { chromium } from "@playwright/test";

const [url, out, x, y, w, h] = process.argv.slice(2);

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--use-gl=angle", "--use-angle=metal", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 3,
});
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector("canvas", { timeout: 30000 });
await page.waitForTimeout(6000);
await page.screenshot({
  path: out,
  clip: { x: Number(x), y: Number(y), width: Number(w), height: Number(h) },
});
console.log("saved", out);
await browser.close();
