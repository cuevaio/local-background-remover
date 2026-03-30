import { cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");

const assets = [
  ["src/renderer/index.html", "dist/renderer/index.html"],
  ["src/renderer/styles.css", "dist/renderer/styles.css"],
];

for (const [from, to] of assets) {
  const fromPath = resolve(projectRoot, from);
  const toPath = resolve(projectRoot, to);
  mkdirSync(dirname(toPath), { recursive: true });
  cpSync(fromPath, toPath);
}
