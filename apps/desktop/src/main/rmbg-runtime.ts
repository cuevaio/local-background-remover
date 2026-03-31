const path = require("node:path");
export {};

type ExistsSyncFn = (targetPath: string) => boolean;

type RmbgResolveInput = {
  repoRoot: string;
  rmbgProjectDir: string;
  env: NodeJS.ProcessEnv;
  isPackaged: boolean;
  processResourcesPath: string;
  existsSyncFn: ExistsSyncFn;
};

type RmbgCommand = {
  command: string;
  commandArgs: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  source: "env" | "packaged" | "venv" | "uv";
};

function executableName() {
  return process.platform === "win32" ? "rmbg.exe" : "rmbg";
}

function resolvePackagedRmbgBinary(input: RmbgResolveInput) {
  return path.join(input.processResourcesPath, "rmbg", executableName());
}

function resolveRmbgCommand(input: RmbgResolveInput, args: string[]): RmbgCommand {
  const envPath = String(input.env.RMBG_DESKTOP_CLI_PATH || "").trim();
  if (envPath) {
    return {
      command: envPath,
      commandArgs: args,
      cwd: input.repoRoot,
      env: input.env,
      source: "env",
    };
  }

  if (input.isPackaged) {
    const packagedRmbg = resolvePackagedRmbgBinary(input);
    if (!input.existsSyncFn(packagedRmbg)) {
      throw new Error(
        `Packaged rmbg runtime not found at ${packagedRmbg}. Rebuild desktop package with bundled runtime.`,
      );
    }

    return {
      command: packagedRmbg,
      commandArgs: args,
      cwd: input.processResourcesPath,
      env: input.env,
      source: "packaged",
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
  resolvePackagedRmbgBinary,
  resolveRmbgCommand,
};
