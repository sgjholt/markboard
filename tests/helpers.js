import { readFileSync } from "fs";
import { join } from "path";

// Extract the <script> block from index.html and evaluate it
// in a minimal sandbox that stubs out browser globals.

const html = readFileSync(join(import.meta.dirname, "..", "index.html"), "utf8");
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) throw new Error("Could not find <script> block in index.html");

const scriptSource = scriptMatch[1];

// Stub the minimal browser globals the script expects at parse time
const sandbox = {
  window: { showOpenFilePicker: true },
  document: {
    getElementById: () => ({
      addEventListener: () => {},
      disabled: false,
      textContent: "",
      style: {},
    }),
    documentElement: { setAttribute: () => {} },
    querySelectorAll: () => [],
    addEventListener: () => {},
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  setTimeout: () => {},
  clearTimeout: () => {},
  confirm: () => true,
};

// Build a function that runs the script and returns the globals we need
const wrappedScript = `
  ${Object.keys(sandbox).map((k) => `var ${k} = __sandbox__.${k};`).join("\n")}
  ${scriptSource}
  return { parseMD, serialiseMD };
`;

const fn = new Function("__sandbox__", wrappedScript);
const { parseMD, serialiseMD } = fn(sandbox);

export { parseMD, serialiseMD };
