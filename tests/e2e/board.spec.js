const { test, expect } = require("@playwright/test");
const { readFileSync } = require("fs");
const { join } = require("path");

const exampleMD = readFileSync(join(__dirname, "..", "..", "example.md"), "utf8");

test.describe("MarkBoard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows the connect screen on load", async ({ page }) => {
    await expect(page.locator("#connect-screen")).toBeVisible();
    await expect(page.locator("#board")).toBeHidden();
  });

  test("open button is present and enabled", async ({ page }) => {
    const btn = page.locator("#open-btn");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test("theme buttons switch themes", async ({ page }) => {
    const themeButtons = page.locator(".theme-btn");
    await expect(themeButtons).toHaveCount(7); // 4 built-in + Custom (hidden) + + CSS + + Icon

    await page.locator('.theme-btn[data-theme="light"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.locator('.theme-btn[data-theme="ocean"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "ocean");
  });

  test("theme persists across page reloads", async ({ page }) => {
    await page.locator('.theme-btn[data-theme="amber"]').click();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "amber");
  });

  test("renders a board loaded via JS injection", async ({ page }) => {
    await page.evaluate((md) => {
      const d = parseMD(md);
      BOARDS.push({ name: "example", fileHandle: null, data: d, unsaved: false });
      ACTIVE = 0;
      showBoard();
      renderTabs();
      render();
    }, exampleMD);

    await expect(page.locator("#board")).toBeVisible();
    await expect(page.locator("#connect-screen")).toBeHidden();

    const title = page.locator("#board-title");
    await expect(title).not.toHaveText("");

    const phases = page.locator(".phase-card");
    expect(await phases.count()).toBeGreaterThanOrEqual(1);

    const features = page.locator(".feature");
    expect(await features.count()).toBeGreaterThanOrEqual(1);

    await expect(page.locator(".tab")).toHaveCount(1);
  });

  test("clicking a feature cycles its status", async ({ page }) => {
    await page.evaluate((md) => {
      const d = parseMD(md);
      window.saveBoard = () => {};
      BOARDS.push({ name: "test", fileHandle: null, data: d, unsaved: false });
      ACTIVE = 0;
      showBoard();
      renderTabs();
      render();
    }, exampleMD);

    const pendingFeature = page.locator('.feat-status:text("Pending")').first();
    const featureRow = pendingFeature.locator("..");

    await featureRow.click();
    await expect(page.locator('.feat-status:text("Active")').first()).toBeVisible();
  });

  test("stats section displays progress percentage", async ({ page }) => {
    await page.evaluate((md) => {
      const d = parseMD(md);
      window.saveBoard = () => {};
      BOARDS.push({ name: "test", fileHandle: null, data: d, unsaved: false });
      ACTIVE = 0;
      showBoard();
      renderTabs();
      render();
    }, exampleMD);

    const pct = page.locator("#s-pct");
    const text = await pct.textContent();
    expect(text).toMatch(/\d+%/);
  });

  test("notes textarea is visible", async ({ page }) => {
    await page.evaluate((md) => {
      const d = parseMD(md);
      window.saveBoard = () => {};
      BOARDS.push({ name: "test", fileHandle: null, data: d, unsaved: false });
      ACTIVE = 0;
      showBoard();
      renderTabs();
      render();
    }, exampleMD);

    await expect(page.locator("#notes")).toBeVisible();
  });
});
