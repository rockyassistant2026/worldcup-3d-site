// Ad-hoc visual verification: load the dev server and screenshot the WebGL canvas.
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:5173";
const out = process.argv[3] ?? "/tmp/stadium.png";

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--use-gl=angle", "--use-angle=metal", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector("canvas", { timeout: 20000 });
await page.waitForTimeout(6000);
await page.screenshot({ path: out });
console.log("saved", out);
console.log("console errors:", errors.length ? errors : "none");
await browser.close();
