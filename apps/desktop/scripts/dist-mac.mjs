import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const desktopRoot = path.resolve(import.meta.dirname, "..");
const binName = process.platform === "win32" ? "electron-builder.cmd" : "electron-builder";
const localBuilderBin = path.join(desktopRoot, "node_modules", ".bin", binName);

const SIGNING_ENV_KEYS = [
  "CSC_LINK",
  "CSC_NAME",
  "CSC_KEY_PASSWORD",
  "APPLE_ID",
  "APPLE_APP_SPECIFIC_PASSWORD",
  "APPLE_TEAM_ID",
];

const hasSigningEnv = SIGNING_ENV_KEYS.some((key) => String(process.env[key] || "").trim().length > 0);

const env = {
  ...process.env,
};

if (!hasSigningEnv && !String(process.env.CSC_IDENTITY_AUTO_DISCOVERY || "").trim()) {
  env.CSC_IDENTITY_AUTO_DISCOVERY = "false";
  console.log("No signing env vars detected. Building unsigned local mac artifacts.");
} else {
  console.log("Signing env vars detected. electron-builder signing is enabled.");
}

const command = fs.existsSync(localBuilderBin) ? localBuilderBin : binName;
const args = ["--mac", "dmg", "zip"];

if (!hasSigningEnv) {
  args.push("--config.mac.identity=null");
}

const child = spawn(command, args, {
  cwd: desktopRoot,
  env,
  shell: false,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(`Failed to start electron-builder: ${error.message}`);
  process.exitCode = 1;
});

child.on("close", (code) => {
  process.exitCode = code ?? 1;
});
