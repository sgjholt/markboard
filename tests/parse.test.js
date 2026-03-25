import { describe, it, expect } from "vitest";
import { parseMD } from "./helpers.js";

describe("parseMD", () => {
  it("extracts the board title", () => {
    const d = parseMD("# My Project\n");
    expect(d.title).toBe("My Project");
  });

  it("defaults to 'Untitled Board' when no title", () => {
    const d = parseMD("");
    expect(d.title).toBe("Untitled Board");
  });

  it("parses meta comment", () => {
    const d = parseMD("# T\n\n<!-- meta: version=2.0 updated=2026-01-15 tests=99 -->\n");
    expect(d.meta).toEqual({ version: "2.0", updated: "2026-01-15", tests: "99" });
  });

  it("parses a phase with status", () => {
    const d = parseMD("# T\n\n## Alpha | active\n");
    expect(d.phases).toHaveLength(1);
    expect(d.phases[0].title).toBe("Alpha");
    expect(d.phases[0].status).toBe("active");
  });

  it("parses phase subtitle", () => {
    const d = parseMD("# T\n\n## Alpha | done\n<!-- sub: Weeks 1-2 -->\n");
    expect(d.phases[0].sub).toBe("Weeks 1-2");
  });

  it("parses features with all three statuses", () => {
    const md = [
      "# T",
      "## P | active",
      "- [x] Done thing",
      "- [~] Active thing",
      "- [ ] Pending thing",
    ].join("\n");
    const d = parseMD(md);
    expect(d.phases[0].features).toHaveLength(3);
    expect(d.phases[0].features[0].status).toBe("done");
    expect(d.phases[0].features[1].status).toBe("active");
    expect(d.phases[0].features[2].status).toBe("pending");
  });

  it("parses feature descriptions", () => {
    const d = parseMD("# T\n## P | active\n- [ ] Login :: OAuth2 integration\n");
    expect(d.phases[0].features[0].name).toBe("Login");
    expect(d.phases[0].features[0].desc).toBe("OAuth2 integration");
  });

  it("parses due dates", () => {
    const d = parseMD("# T\n## P | active\n- [ ] Ship :: desc [2026-06-15]\n");
    expect(d.phases[0].features[0].dueDate).toBe("2026-06-15");
  });

  it("handles feature with due date but no description", () => {
    const d = parseMD("# T\n## P | active\n- [ ] Ship [2026-06-15]\n");
    expect(d.phases[0].features[0].name).toBe("Ship");
    expect(d.phases[0].features[0].dueDate).toBe("2026-06-15");
    expect(d.phases[0].features[0].desc).toBe("");
  });

  it("parses notes section", () => {
    const md = "# T\n## P | done\n- [x] F\n\n## Notes\n\nSome notes here.\nLine two.\n";
    const d = parseMD(md);
    expect(d.notes).toBe("Some notes here.\nLine two.");
  });

  it("handles multiple phases", () => {
    const md = [
      "# T",
      "## Phase 1 | done",
      "- [x] A",
      "## Phase 2 | active",
      "- [~] B",
      "## Phase 3 | pending",
      "- [ ] C",
    ].join("\n");
    const d = parseMD(md);
    expect(d.phases).toHaveLength(3);
    expect(d.phases[0].status).toBe("done");
    expect(d.phases[1].status).toBe("active");
    expect(d.phases[2].status).toBe("pending");
  });

  it("returns empty phases and notes for minimal input", () => {
    const d = parseMD("# Empty Board\n");
    expect(d.phases).toEqual([]);
    expect(d.notes).toBe("");
  });
});
