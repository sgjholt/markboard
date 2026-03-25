# MarkBoard

A plain-text project tracker powered by Markdown. Your board data lives in a `.md` file you own — version-controllable, human-readable, and editable in any text editor. The `index.html` file provides a visual board that reads and writes it directly.

No server. No database. No accounts. One HTML file + one Markdown file.

---

## Quick start

1. Download `index.html`
2. Open it in Chrome or Edge (86+)
3. Click **Open a board (.md)** and select `example.md` (or any `.md` file using the format below)
4. Changes you make in the board write back to the file automatically

---

## Markdown format

```markdown
# Board Title

<!-- meta: version=1.0 updated=2026-01-01 tests=42 -->

## Phase Name | done
<!-- sub: Optional subtitle or date range -->
- [x] Done feature :: Optional description
- [~] In-progress feature :: Description [2026-04-15]
- [ ] Pending feature

## Another Phase | active
<!-- sub: Current phase -->
- [ ] Feature with due date :: Description [2026-06-01]
- [ ] Feature without due date

## Notes

Free text notes here. Saved automatically.
```

### Feature status markers

| Marker | Status      |
|--------|-------------|
| `[x]`  | Done        |
| `[~]`  | In progress |
| `[ ]`  | Pending     |

### Phase status

Append `| done`, `| active`, or `| pending` to any `##` heading. The board will auto-derive this from its features when you click — but you can also set it manually in the file.

### Due dates

Add `[YYYY-MM-DD]` at the end of a feature line (after the description). The board colour-codes them:

- **Red** — overdue
- **Amber** — due within 7 days
- **Grey** — future
- **Strikethrough** — done (date preserved for reference)

### Meta comment

The `<!-- meta: key=value ... -->` comment is optional. Recognised keys:

| Key       | Description                        |
|-----------|------------------------------------|
| `version` | Shown in the board header          |
| `updated` | Auto-updated on every save         |
| `tests`   | Shown in the stats bar             |

---

## Features

- **Multiple boards** — open several `.md` files as tabs, switch between them
- **Click to cycle** — click any feature to cycle pending → active → done
- **Drag to reorder** — drag features within a phase, or drag phases to reorder
- **Due dates** — colour-coded overdue/soon/future badges
- **4 themes** — Dark, Light, Ocean, Amber (remembered across sessions)
- **Auto-save** — every status change writes back to the `.md` file immediately
- **Notes field** — free-text area saved to the `## Notes` section
- **Zero dependencies** — single HTML file, works offline

---

## Requirements

Chrome or Edge 86+ (uses the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) to read and write local files). Firefox does not support this API.

---

## Using with version control

Because your board data is a plain `.md` file, you can commit it alongside your code:

```bash
git add tracker.md
git commit -m "docs: mark search feature as done"
```

Diffs are human-readable. You get a full history of your project progress.

---

## License

MIT — see [LICENSE](LICENSE)
