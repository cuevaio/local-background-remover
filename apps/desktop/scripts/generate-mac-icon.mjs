import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const desktopRoot = path.resolve(import.meta.dirname, "..");
const sourceIconPath = path.resolve(desktopRoot, "../web/src/app/icon.svg");
const buildDir = path.join(desktopRoot, "build");
const outputIconPath = path.join(buildDir, "icon.icns");
const tempRoot = mkdtempSync(path.join(os.tmpdir(), "background-removal-icon-"));
const iconsetDir = path.join(tempRoot, "icon.iconset");
const previewPath = path.join(tempRoot, "icon.svg.png");

const iconsetEntries = [
  [16, "icon_16x16.png"],
  [32, "icon_16x16@2x.png"],
  [32, "icon_32x32.png"],
  [64, "icon_32x32@2x.png"],
  [128, "icon_128x128.png"],
  [256, "icon_128x128@2x.png"],
  [256, "icon_256x256.png"],
  [512, "icon_256x256@2x.png"],
  [512, "icon_512x512.png"],
  [1024, "icon_512x512@2x.png"],
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr]
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .join("\n")
      .trim();

    fail(details ? `${command} failed.\n${details}` : `${command} failed.`);
  }
}

if (process.platform !== "darwin") {
  fail("macOS app icon generation requires macOS because it uses qlmanage, sips, and iconutil.");
}

if (!existsSync(sourceIconPath)) {
  fail(`Source icon not found at ${sourceIconPath}`);
}

mkdirSync(buildDir, { recursive: true });
mkdirSync(iconsetDir, { recursive: true });

try {
  run("qlmanage", ["-t", "-s", "1024", "-o", tempRoot, sourceIconPath]);

  if (!existsSync(previewPath)) {
    fail(`Expected rasterized icon preview at ${previewPath}`);
  }

  for (const [size, name] of iconsetEntries) {
    run("sips", ["-z", String(size), String(size), previewPath, "--out", path.join(iconsetDir, name)]);
  }

  run("iconutil", ["-c", "icns", iconsetDir, "-o", outputIconPath]);
  console.log(`Generated ${outputIconPath}`);
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
