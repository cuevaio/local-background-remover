import fs from "node:fs";
import path from "node:path";

const desktopRoot = path.resolve(import.meta.dirname, "..");
const repoRoot = path.resolve(desktopRoot, "../..");
const sourceDir = path.join(repoRoot, "apps", "rmbg", "dist", "rmbg");
const sourceBin = path.join(sourceDir, "rmbg");
const targetDir = path.join(desktopRoot, "build-resources", "rmbg");

if (!fs.existsSync(sourceDir) || !fs.existsSync(sourceBin)) {
  throw new Error(
    [
      "Missing packaged rmbg runtime.",
      "Run `cd apps/rmbg && bun run package:mac` first.",
      `Expected folder: ${sourceDir}`,
    ].join(" "),
  );
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(targetDir), { recursive: true });
fs.cpSync(sourceDir, targetDir, {
  recursive: true,
  dereference: true,
});

try {
  fs.chmodSync(path.join(targetDir, "rmbg"), 0o755);
} catch {
  // Best effort. File permissions may already be correct.
}

console.log(`Prepared runtime at ${targetDir}`);
