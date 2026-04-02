import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const UPDATER_FRAMEWORKS = [
  {
    name: "Squirrel.framework",
    requiredPaths: [
      ["Versions", "Current", "Squirrel"],
      ["Versions", "Current", "Resources", "ShipIt"],
    ],
  },
  {
    name: "Mantle.framework",
    requiredPaths: [["Versions", "Current", "Mantle"]],
  },
  {
    name: "ReactiveObjC.framework",
    requiredPaths: [["Versions", "Current", "ReactiveObjC"]],
  },
];

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getLinkedLibraries(binaryPath) {
  const result = spawnSync("otool", ["-L", binaryPath], { encoding: "utf8" });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr]
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .join("\n")
      .trim();

    throw new Error(details ? `Failed to inspect linked macOS libraries.\n${details}` : "Failed to inspect linked macOS libraries.");
  }

  return result.stdout;
}

export default async function pruneMacUpdaterFrameworks(context) {
  if (context.electronPlatformName !== "darwin") {
    return;
  }

  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  const frameworksDir = path.join(appPath, "Contents", "Frameworks");

  if (!(await pathExists(frameworksDir))) {
    throw new Error(`Missing macOS frameworks directory: ${frameworksDir}`);
  }

  const frameworkState = await Promise.all(
    UPDATER_FRAMEWORKS.map(async (framework) => {
      const frameworkPath = path.join(frameworksDir, framework.name);
      return {
        ...framework,
        frameworkPath,
        exists: await pathExists(frameworkPath),
      };
    }),
  );

  const presentFrameworks = frameworkState.filter((framework) => framework.exists);

  if (presentFrameworks.length === 0) {
    console.log("No mac updater frameworks found to prune.");
    return;
  }

  const missingFrameworks = frameworkState.filter((framework) => !framework.exists);

  if (missingFrameworks.length > 0) {
    throw new Error(
      [
        "Found a partial mac updater framework stack while pruning.",
        `Present: ${presentFrameworks.map((framework) => framework.name).join(", ")}`,
        `Missing: ${missingFrameworks.map((framework) => framework.name).join(", ")}`,
      ].join(" "),
    );
  }

  for (const framework of presentFrameworks) {
    for (const requiredPathParts of framework.requiredPaths) {
      const requiredPath = path.join(framework.frameworkPath, ...requiredPathParts);

      if (!(await pathExists(requiredPath))) {
        throw new Error(`Expected updater framework path moved or missing: ${requiredPath}`);
      }
    }
  }

  const electronFrameworkBinaryPath = path.join(
    frameworksDir,
    "Electron Framework.framework",
    "Versions",
    "A",
    "Electron Framework",
  );

  if (!(await pathExists(electronFrameworkBinaryPath))) {
    throw new Error(`Missing Electron Framework binary while pruning: ${electronFrameworkBinaryPath}`);
  }

  const linkedLibraries = getLinkedLibraries(electronFrameworkBinaryPath);
  const requiredFrameworks = presentFrameworks.filter((framework) =>
    linkedLibraries.includes(`@rpath/${framework.name}/${framework.name.replace(".framework", "")}`),
  );

  if (requiredFrameworks.length > 0) {
    console.log(
      [
        "Skipping mac updater framework pruning because Electron Framework still links against:",
        requiredFrameworks.map((framework) => framework.name).join(", "),
      ].join(" "),
    );
    return;
  }

  console.log(`Pruning unused mac updater frameworks from ${frameworksDir}`);

  await Promise.all(
    presentFrameworks.map((framework) => fs.rm(framework.frameworkPath, { recursive: true, force: false })),
  );

  console.log(`Removed updater frameworks: ${presentFrameworks.map((framework) => framework.name).join(", ")}`);
}
