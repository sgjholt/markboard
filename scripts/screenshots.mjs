import { chromium } from "@playwright/test";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const exampleMD = readFileSync(join(root, "example.md"), "utf8");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // Serve from local file
  await page.goto("http://localhost:3123/");

  // 1. Landing page
  await page.screenshot({ path: join(root, "screenshots", "landing.png") });
  console.log("Saved: landing.png");

  // 2. Board view (dark theme)
  await page.evaluate((md) => {
    const d = parseMD(md);
    window.saveBoard = () => {};
    BOARDS.push({ name: "example", fileHandle: null, data: d, unsaved: false });
    ACTIVE = 0;
    showBoard();
    renderTabs();
    render();
  }, exampleMD);
  await page.screenshot({ path: join(root, "screenshots", "board-dark.png") });
  console.log("Saved: board-dark.png");

  // 3. Board view (light theme)
  await page.evaluate(() => setTheme("light"));
  await page.screenshot({ path: join(root, "screenshots", "board-light.png") });
  console.log("Saved: board-light.png");

  await browser.close();
}

main();
