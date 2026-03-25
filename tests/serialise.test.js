import { describe, it, expect, vi } from "vitest";
import { parseMD, serialiseMD } from "./helpers.js";

// Freeze Date so `updated` meta is deterministic
vi.useFakeTimers();
vi.setSystemTime(new Date("2026-03-25T00:00:00Z"));

describe("serialiseMD", () => {
  it("outputs the board title as an H1", () => {
    const out = serialiseMD({ title: "My Board", meta: {}, phases: [], notes: "" });
    expect(out).toMatch(/^# My Board\n/);
  });

  it("includes meta comment with updated date", () => {
    const out = serialiseMD({ title: "T", meta: { version: "1.0" }, phases: [], notes: "" });
    expect(out).toContain("<!-- meta: version=1.0 updated=2026-03-25 -->");
  });

  it("serialises phases with status", () => {
    const out = serialiseMD({
      title: "T", meta: {}, notes: "",
      phases: [{ title: "Alpha", status: "active", sub: "", features: [] }],
    });
    expect(out).toContain("## Alpha | active");
  });

  it("serialises phase subtitles", () => {
    const out = serialiseMD({
      title: "T", meta: {}, notes: "",
      phases: [{ title: "P", status: "done", sub: "Week 1", features: [] }],
    });
    expect(out).toContain("<!-- sub: Week 1 -->");
  });

  it("serialises feature status markers correctly", () => {
    const out = serialiseMD({
      title: "T", meta: {}, notes: "",
      phases: [{
        title: "P", status: "active", sub: "", features: [
          { name: "A", desc: "", status: "done", dueDate: null },
          { name: "B", desc: "", status: "active", dueDate: null },
          { name: "C", desc: "", status: "pending", dueDate: null },
        ],
      }],
    });
    expect(out).toContain("- [x] A");
    expect(out).toContain("- [~] B");
    expect(out).toContain("- [ ] C");
  });

  it("serialises descriptions and due dates", () => {
    const out = serialiseMD({
      title: "T", meta: {}, notes: "",
      phases: [{
        title: "P", status: "active", sub: "", features: [
          { name: "Ship", desc: "Launch it", status: "pending", dueDate: "2026-06-15" },
        ],
      }],
    });
    expect(out).toContain("- [ ] Ship :: Launch it [2026-06-15]");
  });

  it("includes notes section", () => {
    const out = serialiseMD({ title: "T", meta: {}, phases: [], notes: "Remember this." });
    expect(out).toContain("## Notes");
    expect(out).toContain("Remember this.");
  });

  it("round-trips through parseMD without data loss", () => {
    const original = {
      title: "Round Trip",
      meta: { version: "3.0" },
      phases: [
        {
          title: "Phase 1", status: "done", sub: "Foundation",
          features: [
            { name: "Setup", desc: "Repo and CI", status: "done", dueDate: "2026-01-10" },
            { name: "Auth", desc: "", status: "done", dueDate: null },
          ],
        },
        {
          title: "Phase 2", status: "active", sub: "",
          features: [
            { name: "API", desc: "REST endpoints", status: "active", dueDate: "2026-04-01" },
            { name: "UI", desc: "", status: "pending", dueDate: null },
          ],
        },
      ],
      notes: "Some notes\nWith multiple lines",
    };

    const md = serialiseMD(original);
    const parsed = parseMD(md);

    expect(parsed.title).toBe(original.title);
    expect(parsed.meta.version).toBe(original.meta.version);
    expect(parsed.phases).toHaveLength(2);
    expect(parsed.phases[0].title).toBe("Phase 1");
    expect(parsed.phases[0].sub).toBe("Foundation");
    expect(parsed.phases[0].features).toHaveLength(2);
    expect(parsed.phases[0].features[0].name).toBe("Setup");
    expect(parsed.phases[0].features[0].desc).toBe("Repo and CI");
    expect(parsed.phases[0].features[0].dueDate).toBe("2026-01-10");
    expect(parsed.phases[1].features[0].status).toBe("active");
    expect(parsed.notes).toBe("Some notes\nWith multiple lines");
  });
});
