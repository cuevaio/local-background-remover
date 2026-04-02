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

const requireSigning = String(process.env.RMBG_REQUIRE_MAC_SIGNING || "").trim() === "true";
const missingSigningEnvKeys = SIGNING_ENV_KEYS.filter((key) => String(process.env[key] || "").trim().length === 0);
const hasAllSigningEnv = missingSigningEnvKeys.length === 0;
const hasAnySigningEnv = missingSigningEnvKeys.length !== SIGNING_ENV_KEYS.length;

const env = {
  ...process.env,
};

if (requireSigning && !hasAllSigningEnv) {
  console.error(
    [
      "Missing required mac signing/notarization env vars for release packaging.",
      `Missing: ${missingSigningEnvKeys.join(", ")}`,
    ].join(" "),
  );
  process.exit(1);
}

if (hasAnySigningEnv && !hasAllSigningEnv) {
  console.error(
    [
      "Incomplete mac signing/notarization environment.",
      `Missing: ${missingSigningEnvKeys.join(", ")}`,
    ].join(" "),
  );
  process.exit(1);
}

if (!hasAllSigningEnv && !String(process.env.CSC_IDENTITY_AUTO_DISCOVERY || "").trim()) {
  env.CSC_IDENTITY_AUTO_DISCOVERY = "false";
  console.log("No signing env vars detected. Building unsigned local mac artifacts.");
} else {
  console.log("Signing env vars detected. electron-builder signing is enabled.");
}

const command = fs.existsSync(localBuilderBin) ? localBuilderBin : binName;
const args = ["--mac", "dmg"];

if (!hasAllSigningEnv) {
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
