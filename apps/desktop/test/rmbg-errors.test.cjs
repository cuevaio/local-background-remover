const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeCommandFailure, normalizeWorkerFailure } = require("../dist/main/rmbg-errors.js");

test("normalizes CLI JSON error and maps exit code", () => {
  const error = normalizeCommandFailure({
    command: "rmbg",
    args: ["remove"],
    code: 6,
    stdout: '{"ok":false,"error":"License check failed: missing key"}',
    stderr: "",
  });

  assert.equal(error.kind, "license");
  assert.equal(error.exitCode, 6);
  assert.match(error.message, /License check failed/);
});

test("uses stderr fallback when stdout is not JSON", () => {
  const error = normalizeCommandFailure({
    command: "rmbg",
    args: ["remove"],
    code: 4,
    stdout: "",
    stderr: "Inference failed: bad tensor",
  });

  assert.equal(error.kind, "inference");
  assert.equal(error.message, "Inference failed: bad tensor");
});

test("normalizes worker failure with stderr context", () => {
  const error = normalizeWorkerFailure("worker request failed", "traceback details");
  assert.equal(error.kind, "runtime");
  assert.match(error.message, /traceback details/);
});
