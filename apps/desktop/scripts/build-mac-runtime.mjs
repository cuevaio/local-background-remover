import path from "node:path";
import { spawnSync } from "node:child_process";

const desktopRoot = path.resolve(import.meta.dirname, "..");
const rmbgRoot = path.resolve(desktopRoot, "../rmbg");
const bunExecutable = process.platform === "win32" ? "bun.exe" : "bun";

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(bunExecutable, ["run", "package:mac"], rmbgRoot);
