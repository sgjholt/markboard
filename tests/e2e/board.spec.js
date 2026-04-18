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

  test("feature cards have ARIA roles for keyboard accessibility", async ({ page }) => {
    await page.evaluate((md) => {
      const d = parseMD(md);
      window.saveBoard = () => {};
      BOARDS.push({ name: "test", fileHandle: null, data: d, unsaved: false });
      ACTIVE = 0;
      showBoard(); renderTabs(); render();
    }, exampleMD);

    const firstFeature = page.locator(".feature").first();
    await expect(firstFeature).toHaveAttribute("role", "button");
    await expect(firstFeature).toHaveAttribute("tabindex", "0");
    await expect(firstFeature).toHaveAttribute("aria-label");
  });

  test("reordering features within a phase updates data order", async ({ page }) => {
    const testMD = [
      "# Drag Test",
      "## Phase 1 | active",
      "- [ ] Alpha",
      "- [ ] Beta",
      "- [ ] Gamma",
    ].join("\n");

    await page.evaluate((md) => {
      const d = parseMD(md);
      window.saveBoard = () => {};
      BOARDS.push({ name: "drag-test", fileHandle: null, data: d, unsaved: false, plugins: { favicon: null, css: null } });
      ACTIVE = 0;
      showBoard(); renderTabs(); render();
    }, testMD);

    const features = page.locator(".feature");
    await expect(features).toHaveCount(3);

    // Verify initial order
    await expect(features.nth(0).locator(".feat-name")).toHaveText("Alpha");
    await expect(features.nth(1).locator(".feat-name")).toHaveText("Beta");
    await expect(features.nth(2).locator(".feat-name")).toHaveText("Gamma");

    // Drag first feature (Alpha) to after the third (Gamma)
    const src = features.nth(0);
    const dst = features.nth(2);
    await src.dragTo(dst, { targetPosition: { x: 10, y: dst.boundingBox().then(b => b ? b.height * 0.8 : 10) } });

    // After drop, check in-memory data order changed
    const names = await page.evaluate(() => BOARDS[0].data.phases[0].features.map(f => f.name));
    expect(names[names.length - 1]).toBe("Alpha");
  });

  test("reordering phases updates data order", async ({ page }) => {
    const testMD = [
      "# Phase Drag Test",
      "## Phase Alpha | done",
      "- [x] A1",
      "## Phase Beta | active",
      "- [~] B1",
    ].join("\n");

    await page.evaluate((md) => {
      const d = parseMD(md);
      window.saveBoard = () => {};
      BOARDS.push({ name: "phase-drag", fileHandle: null, data: d, unsaved: false, plugins: { favicon: null, css: null } });
      ACTIVE = 0;
      showBoard(); renderTabs(); render();
    }, testMD);

    const phases = page.locator(".phase-card");
    await expect(phases).toHaveCount(2);

    // Drag Phase Alpha header (first) to after Phase Beta (second)
    const srcHeader = phases.nth(0).locator(".phase-header");
    const dstHeader = phases.nth(1).locator(".phase-header");
    await srcHeader.dragTo(dstHeader);

    const phaseNames = await page.evaluate(() => BOARDS[0].data.phases.map(p => p.title));
    // After swap, Beta should be first
    expect(phaseNames[0]).toBe("Phase Beta");
    expect(phaseNames[1]).toBe("Phase Alpha");
  });
});
