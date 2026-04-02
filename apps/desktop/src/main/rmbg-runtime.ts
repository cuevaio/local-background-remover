const path = require("node:path");
export {};

type ExistsSyncFn = (targetPath: string) => boolean;

type RmbgResolveInput = {
  repoRoot: string;
  rmbgProjectDir: string;
  env: NodeJS.ProcessEnv;
  isPackaged: boolean;
  installedRuntimePath: string;
  existsSyncFn: ExistsSyncFn;
};

type RmbgCommand = {
  command: string;
  commandArgs: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  source: "env" | "installed" | "venv" | "uv";
};

function executableName() {
  return process.platform === "win32" ? "rmbg.exe" : "rmbg";
}

function resolveRmbgCommand(input: RmbgResolveInput, args: string[]): RmbgCommand {
  const envPath = String(input.env.RMBG_DESKTOP_CLI_PATH || "").trim();
  if (envPath) {
    return {
      command: envPath,
      commandArgs: args,
      cwd: input.isPackaged ? path.dirname(envPath) : input.repoRoot,
      env: input.env,
      source: "env",
    };
  }

  if (input.isPackaged) {
    const installedRmbg = String(input.installedRuntimePath || "").trim();
    if (!installedRmbg || !input.existsSyncFn(installedRmbg)) {
      throw new Error(
        `Installed rmbg runtime not found at ${installedRmbg || "<unset>"}. Run runtime setup first.`,
      );
    }

    return {
      command: installedRmbg,
      commandArgs: args,
      cwd: path.dirname(installedRmbg),
      env: input.env,
      source: "installed",
    };
  }

  const venvRmbg = path.join(input.rmbgProjectDir, ".venv", "bin", executableName());
  if (input.existsSyncFn(venvRmbg)) {
    return {
      command: venvRmbg,
      commandArgs: args,
      cwd: input.repoRoot,
      env: input.env,
      source: "venv",
    };
  }

  return {
    command: "uv",
    commandArgs: ["run", "--project", input.rmbgProjectDir, "rmbg", ...args],
    cwd: input.repoRoot,
    env: input.env,
    source: "uv",
  };
}

module.exports = {
  resolveRmbgCommand,
};
