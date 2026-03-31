export {};

type JsonMap = Record<string, unknown>;

type RmbgErrorKind = "license" | "model" | "input" | "inference" | "output" | "runtime";

type CommandFailurePayload = {
  command: string;
  args: string[];
  code: number | null;
  stdout: string;
  stderr: string;
};

type NormalizedRmbgError = {
  kind: RmbgErrorKind;
  message: string;
  exitCode: number | null;
  details: JsonMap;
};

function parseJsonObject(raw: string): JsonMap | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as JsonMap;
    }
  } catch {
    return null;
  }

  return null;
}

function kindFromExitCode(code: number | null): RmbgErrorKind {
  if (code === 6) {
    return "license";
  }
  if (code === 3) {
    return "model";
  }
  if (code === 2) {
    return "input";
  }
  if (code === 4) {
    return "inference";
  }
  if (code === 5) {
    return "output";
  }
  return "runtime";
}

function kindFromMessage(message: string): RmbgErrorKind {
  const lower = message.toLowerCase();
  if (lower.includes("license")) {
    return "license";
  }
  if (lower.includes("model")) {
    return "model";
  }
  if (lower.includes("input") || lower.includes("read")) {
    return "input";
  }
  if (lower.includes("inference")) {
    return "inference";
  }
  if (lower.includes("output") || lower.includes("write")) {
    return "output";
  }
  return "runtime";
}

function normalizeCommandFailure(payload: CommandFailurePayload): NormalizedRmbgError {
  const parsed = parseJsonObject(payload.stdout);
  const parsedError = typeof parsed?.error === "string" ? parsed.error : null;
  const stderr = payload.stderr.trim();
  const stdout = payload.stdout.trim();
  const fallback = stderr || stdout || `rmbg exited with code ${payload.code}`;
  const message = parsedError || fallback;

  const kind = payload.code !== null ? kindFromExitCode(payload.code) : kindFromMessage(message);

  return {
    kind,
    message,
    exitCode: payload.code,
    details: {
      command: payload.command,
      args: payload.args,
      stderr,
      stdout,
      parsed,
    },
  };
}

function normalizeWorkerFailure(message: string, stderr = ""): NormalizedRmbgError {
  const baseMessage = message.trim() || "rmbg worker request failed";
  const fullMessage = stderr.trim() ? `${baseMessage} (${stderr.trim()})` : baseMessage;

  return {
    kind: kindFromMessage(fullMessage),
    message: fullMessage,
    exitCode: null,
    details: {
      stderr: stderr.trim(),
    },
  };
}

module.exports = {
  normalizeCommandFailure,
  normalizeWorkerFailure,
};
