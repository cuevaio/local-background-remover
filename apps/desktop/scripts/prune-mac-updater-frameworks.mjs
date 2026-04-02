import fs from "node:fs/promises";
import path from "node:path";

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

  console.log(`Pruning unused mac updater frameworks from ${frameworksDir}`);

  await Promise.all(
    presentFrameworks.map((framework) => fs.rm(framework.frameworkPath, { recursive: true, force: false })),
  );

  console.log(`Removed updater frameworks: ${presentFrameworks.map((framework) => framework.name).join(", ")}`);
}
