const test = require("node:test");
const assert = require("node:assert/strict");

const { resolveRmbgCommand } = require("../dist/main/rmbg-runtime.js");

function baseInput(overrides = {}) {
  return {
    repoRoot: "/repo",
    rmbgProjectDir: "/repo/apps/rmbg",
    env: {},
    isPackaged: false,
    processResourcesPath: "/Applications/App.app/Contents/Resources",
    existsSyncFn: () => false,
    ...overrides,
  };
}

test("uses RMBG_DESKTOP_CLI_PATH override when set", () => {
  const command = resolveRmbgCommand(
    baseInput({
      env: { RMBG_DESKTOP_CLI_PATH: "/tmp/custom-rmbg" },
    }),
    ["model", "status", "--json"],
  );

  assert.equal(command.command, "/tmp/custom-rmbg");
  assert.equal(command.source, "env");
});

test("uses RMBG_DESKTOP_CLI_PATH override in packaged mode", () => {
  const command = resolveRmbgCommand(
    baseInput({
      env: { RMBG_DESKTOP_CLI_PATH: "/Users/test/.local/bin/rmbg" },
      isPackaged: true,
    }),
    ["license", "status", "--surface", "desktop", "--json"],
  );

  assert.equal(command.command, "/Users/test/.local/bin/rmbg");
  assert.equal(command.source, "env");
});

test("uses uv fallback in dev when venv binary is missing", () => {
  const command = resolveRmbgCommand(baseInput(), ["license", "status"]);

  assert.equal(command.command, "uv");
  assert.equal(command.source, "uv");
  assert.deepEqual(command.commandArgs.slice(0, 4), ["run", "--project", "/repo/apps/rmbg", "rmbg"]);
});

test("throws in packaged mode when bundled runtime is missing", () => {
  assert.throws(
    () =>
      resolveRmbgCommand(
        baseInput({
          isPackaged: true,
        }),
        ["model", "status"],
      ),
    /Packaged rmbg runtime not found/,
  );
});
