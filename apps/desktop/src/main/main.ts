const { app, BrowserWindow, clipboard, dialog, ipcMain, nativeImage, shell } = require("electron");
const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { normalizeCommandFailure, normalizeWorkerFailure } = require("./rmbg-errors");
const { resolveRmbgCommand } = require("./rmbg-runtime");
export {};

type JsonMap = Record<string, unknown>;
type PendingAction = "remove" | "shutdown" | "ensure_model" | string;

type LibraryItem = {
  id: string;
  original_name: string;
  source_path: string;
  output_path: string | null;
  created_at: number;
  processed_at: number | null;
};

type LibraryState = {
  version: 1;
  items: LibraryItem[];
};

type LibraryImportClipboardImagePayload = {
  bytes?: ArrayBuffer | Uint8Array | number[];
  contentType?: string;
  originalName?: string;
};

const repoRoot = path.resolve(__dirname, "../../../../");
const rmbgProjectDir = path.join(repoRoot, "apps", "rmbg");
const storageDir = path.join(app.getPath("pictures"), "Local Background Remover");
const RMBG_INSTALL_URL = "https://local.backgroundrm.com/install";
const DESKTOP_SESSION_FILE_NAME = "runtime-session.json";
const DESKTOP_SESSION_TTL_SECONDS = 300;

type RunRmbgOptions = {
  desktopSession?: boolean;
};

let runtimeInstallPromise: Promise<string> | null = null;
let desktopSessionNonce: string | null = null;
let desktopSessionExpiresAt = 0;

function commandForRmbg(args: string[]) {
  return resolveRmbgCommand(
    {
      repoRoot,
      rmbgProjectDir,
      env: process.env,
      isPackaged: app.isPackaged,
      installedRuntimePath: installedRuntimePath(),
      existsSyncFn: fs.existsSync,
    },
    args,
  );
}

function installedRuntimePath() {
  const executable = process.platform === "win32" ? "rmbg.exe" : "rmbg";
  return path.join(app.getPath("home"), ".local", "bin", executable);
}

function bundledRuntimePath() {
  const executable = process.platform === "win32" ? "rmbg.exe" : "rmbg";
  return path.join(path.dirname(app.getAppPath()), "rmbg", executable);
}

function desktopSessionFilePath() {
  return path.join(app.getPath("userData"), DESKTOP_SESSION_FILE_NAME);
}

function createDesktopSessionEnv() {
  const now = Math.floor(Date.now() / 1000);
  if (!desktopSessionNonce || desktopSessionExpiresAt <= now + 30) {
    desktopSessionNonce = crypto.randomUUID();
    desktopSessionExpiresAt = now + DESKTOP_SESSION_TTL_SECONDS;
    const sessionFile = desktopSessionFilePath();
    fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
    fs.writeFileSync(
      sessionFile,
      JSON.stringify({ nonce: desktopSessionNonce, expires_at: desktopSessionExpiresAt }, null, 2),
      "utf-8",
    );
  }

  return {
    RMBG_DESKTOP_SESSION_FILE: desktopSessionFilePath(),
    RMBG_DESKTOP_SESSION_NONCE: desktopSessionNonce || "",
  };
}

function runCommand(
  command: string,
  commandArgs: string[],
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    stdin?: string;
    errorPrefix?: string;
  } = {},
) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: options.cwd,
      env: options.env,
      shell: false,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error: Error) => {
      reject(error);
    });

    child.on("close", (code: number | null) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const message = stderr.trim() || stdout.trim() || `Process exited with code ${code}`;
      reject(new Error(`${options.errorPrefix || "Command failed"}: ${message}`));
    });

    if (options.stdin) {
      child.stdin.end(options.stdin);
      return;
    }
    child.stdin.end();
  });
}

async function readInstalledRuntimeVersion(binaryPath: string) {
  if (!fs.existsSync(binaryPath)) {
    return null;
  }

  try {
    const { stdout } = await runCommand(binaryPath, ["--version"], {
      env: process.env,
      errorPrefix: "Failed to read rmbg version",
    });
    const match = stdout.trim().match(/^rmbg\s+(.+)$/i);
    return match?.[1]?.trim() || null;
  } catch {
    return null;
  }
}

async function installRuntimeFromScript() {
  const response = await fetch(RMBG_INSTALL_URL);
  if (!response.ok) {
    throw new Error(`Failed to download runtime installer (${response.status})`);
  }

  const script = await response.text();
  await runCommand("/bin/bash", ["-s"], {
    env: {
      ...process.env,
      RMBG_VERSION: app.getVersion(),
    },
    stdin: script,
    errorPrefix: "Runtime install failed",
  });
}

async function ensureDesktopRuntimeInstalled() {
  if (!app.isPackaged) {
    return null;
  }

  const configuredPath = String(process.env.RMBG_DESKTOP_CLI_PATH || "").trim();
  if (configuredPath) {
    if (!fs.existsSync(configuredPath)) {
      throw new Error(`Configured rmbg runtime not found at ${configuredPath}.`);
    }
    return configuredPath;
  }

  if (runtimeInstallPromise) {
    return runtimeInstallPromise;
  }

  runtimeInstallPromise = (async () => {
    const expectedVersion = app.getVersion();
    const bundledPath = bundledRuntimePath();
    const bundledVersion = await readInstalledRuntimeVersion(bundledPath);

    if (bundledVersion === expectedVersion) {
      process.env.RMBG_DESKTOP_CLI_PATH = bundledPath;
      return bundledPath;
    }

    const runtimePath = installedRuntimePath();

    const installedVersion = await readInstalledRuntimeVersion(runtimePath);
    if (installedVersion !== expectedVersion) {
      await installRuntimeFromScript();
    }

    const finalVersion = await readInstalledRuntimeVersion(runtimePath);
    if (finalVersion === expectedVersion) {
      process.env.RMBG_DESKTOP_CLI_PATH = runtimePath;
      return runtimePath;
    }

    if (!fs.existsSync(runtimePath)) {
      throw new Error(`Installed runtime not found at ${runtimePath} after setup.`);
    }
    if (finalVersion) {
      throw new Error(
        `Installed rmbg version ${finalVersion} does not match desktop app version ${expectedVersion}.`,
      );
    }

    throw new Error(`Unable to verify installed rmbg runtime at ${runtimePath}.`);
  })();

  try {
    return await runtimeInstallPromise;
  } finally {
    runtimeInstallPromise = null;
  }
}

function normalizeUserPath(filePath: unknown) {
  if (typeof filePath !== "string" || !filePath.trim()) {
    throw new Error("Path is required");
  }
  return path.normalize(path.resolve(filePath));
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function sanitizeBaseName(value: string) {
  const sanitized = value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
  return sanitized || "image";
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function ensureParentDir(targetPath: string) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
}

function fileExists(targetPath: string) {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

function libraryRootDir() {
  return path.join(app.getPath("pictures"), "Local Background Remover");
}

function libraryOriginalsDir() {
  return path.join(libraryRootDir(), "originals");
}

function libraryOutputsDir() {
  return path.join(libraryRootDir(), "outputs");
}

function libraryManifestPath() {
  return path.join(libraryRootDir(), "library.json");
}

function isPathInsideLibrary(targetPath: string) {
  const relative = path.relative(libraryRootDir(), targetPath);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function ensureLibraryDirs() {
  fs.mkdirSync(libraryOriginalsDir(), { recursive: true });
  fs.mkdirSync(libraryOutputsDir(), { recursive: true });
}

function readLibraryState(): LibraryState {
  ensureLibraryDirs();
  const manifestPath = libraryManifestPath();
  if (!fileExists(manifestPath)) {
    return { version: 1, items: [] };
  }

  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<LibraryState>;
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    return {
      version: 1,
      items: items
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          id: String((item as LibraryItem).id || ""),
          original_name: String((item as LibraryItem).original_name || "image"),
          source_path: String((item as LibraryItem).source_path || ""),
          output_path: (item as LibraryItem).output_path ? String((item as LibraryItem).output_path) : null,
          created_at: Number((item as LibraryItem).created_at || Date.now()),
          processed_at: (item as LibraryItem).processed_at
            ? Number((item as LibraryItem).processed_at)
            : null,
        }))
        .filter((item) => item.id && item.source_path),
    };
  } catch {
    return { version: 1, items: [] };
  }
}

function writeLibraryState(state: LibraryState) {
  ensureLibraryDirs();
  const manifestPath = libraryManifestPath();
  ensureParentDir(manifestPath);
  fs.writeFileSync(manifestPath, JSON.stringify(state, null, 2), "utf-8");
}

function normalizeLibraryItems(items: LibraryItem[]) {
  const normalized: LibraryItem[] = [];
  for (const item of items) {
    if (!fileExists(item.source_path)) {
      continue;
    }
    if (item.output_path && !fileExists(item.output_path)) {
      normalized.push({
        ...item,
        output_path: null,
        processed_at: null,
      });
      continue;
    }
    normalized.push(item);
  }
  return normalized;
}

function extensionFromName(name: string, fallback = ".png") {
  const ext = path.extname(name || "").toLowerCase();
  if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp") {
    return ext;
  }
  return fallback;
}

function extensionFromContentType(contentType: string | null) {
  const value = String(contentType || "").toLowerCase();
  if (value.includes("image/png")) {
    return ".png";
  }
  if (value.includes("image/jpeg") || value.includes("image/jpg")) {
    return ".jpg";
  }
  if (value.includes("image/webp")) {
    return ".webp";
  }
  return ".png";
}

function isSupportedClipboardImageType(contentType: string | null) {
  const value = String(contentType || "").toLowerCase();
  return value === "image/png" || value === "image/jpeg" || value === "image/jpg" || value === "image/webp";
}

function bytesFromPayload(value: unknown) {
  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }
  if (value instanceof ArrayBuffer) {
    return Buffer.from(value);
  }
  if (ArrayBuffer.isView(value)) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }
  if (Array.isArray(value) && value.every((entry) => Number.isInteger(entry) && entry >= 0 && entry <= 255)) {
    return Buffer.from(value);
  }
  throw new Error("Clipboard image bytes are required");
}

function libraryOutputPathFor(itemId: string) {
  return path.join(libraryOutputsDir(), `${itemId}.png`);
}

async function importLocalFileIntoLibrary(inputPath: string): Promise<LibraryItem> {
  ensureLibraryDirs();
  const normalized = normalizeUserPath(inputPath);
  if (!fileExists(normalized)) {
    throw new Error(`File not found: ${normalized}`);
  }

  const originalName = path.basename(normalized);
  const id = createId();
  const ext = extensionFromName(originalName);
  const targetPath = path.join(libraryOriginalsDir(), `${id}${ext}`);
  await fs.promises.copyFile(normalized, targetPath);

  return {
    id,
    original_name: originalName,
    source_path: targetPath,
    output_path: null,
    created_at: Date.now(),
    processed_at: null,
  };
}

async function importUrlIntoLibrary(url: string): Promise<LibraryItem> {
  ensureLibraryDirs();
  if (!isHttpUrl(url)) {
    throw new Error("Invalid image URL");
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image URL (${response.status})`);
  }

  const contentType = response.headers.get("content-type");
  if (!String(contentType || "").includes("image/")) {
    throw new Error("URL does not point to an image");
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const id = createId();
  const ext = extensionFromContentType(contentType);
  let originalName = "image";
  try {
    const parsed = new URL(url);
    originalName = path.basename(parsed.pathname) || `image${ext}`;
  } catch {
    originalName = `image${ext}`;
  }

  const targetPath = path.join(libraryOriginalsDir(), `${id}${ext}`);
  await fs.promises.writeFile(targetPath, bytes);

  return {
    id,
    original_name: originalName,
    source_path: targetPath,
    output_path: null,
    created_at: Date.now(),
    processed_at: null,
  };
}

async function importClipboardImageIntoLibrary(payload: LibraryImportClipboardImagePayload): Promise<LibraryItem> {
  ensureLibraryDirs();
  const contentType = String(payload?.contentType || "").trim().toLowerCase();
  if (!isSupportedClipboardImageType(contentType)) {
    throw new Error("Clipboard image type is not supported yet");
  }

  const bytes = bytesFromPayload(payload?.bytes);
  if (bytes.length === 0) {
    throw new Error("Clipboard image is empty");
  }

  const id = createId();
  const ext = extensionFromContentType(contentType);
  const originalName = String(payload?.originalName || "").trim() || `pasted-image-${id}${ext}`;
  const targetPath = path.join(libraryOriginalsDir(), `${id}${ext}`);
  await fs.promises.writeFile(targetPath, bytes);

  return {
    id,
    original_name: originalName,
    source_path: targetPath,
    output_path: null,
    created_at: Date.now(),
    processed_at: null,
  };
}

function upsertLibraryItems(nextItems: LibraryItem[]) {
  const state = readLibraryState();
  const byId = new Map<string, LibraryItem>();
  for (const item of state.items) {
    byId.set(item.id, item);
  }
  for (const item of nextItems) {
    byId.set(item.id, item);
  }

  const merged = Array.from(byId.values()).sort((a, b) => b.created_at - a.created_at);
  const normalized = normalizeLibraryItems(merged);
  writeLibraryState({ version: 1, items: normalized });
  return normalized;
}

async function removeLibraryItem(itemId: string) {
  const state = readLibraryState();
  const item = state.items.find((candidate) => candidate.id === itemId);
  if (!item) {
    throw new Error("Image not found in library");
  }

  const pathsToDelete = [item.source_path, item.output_path].filter(
    (candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0,
  );

  for (const candidate of pathsToDelete) {
    const normalized = normalizeUserPath(candidate);
    if (!isPathInsideLibrary(normalized)) {
      throw new Error("Refusing to delete files outside the library");
    }
    await fs.promises.rm(normalized, { force: true });
  }

  const items = normalizeLibraryItems(state.items.filter((candidate) => candidate.id !== itemId));
  writeLibraryState({ version: 1, items });
  return items;
}

function normalizeInputReference(inputPath: unknown) {
  if (typeof inputPath !== "string" || !inputPath.trim()) {
    throw new Error("inputPath is required");
  }

  const trimmed = inputPath.trim();
  if (isHttpUrl(trimmed)) {
    return trimmed;
  }

  return normalizeUserPath(trimmed);
}

function inputBaseName(inputPath: string) {
  if (isHttpUrl(inputPath)) {
    try {
      const parsed = new URL(inputPath);
      const name = path.parse(parsed.pathname).name;
      return sanitizeBaseName(name || "image");
    } catch {
      return `image-${Date.now()}`;
    }
  }

  const parsed = path.parse(inputPath);
  return sanitizeBaseName(parsed.name || "image");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 700,
    title: "Local Background Remover",
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

async function runRmbg(args: string[], options: RunRmbgOptions = {}): Promise<JsonMap> {
  await ensureDesktopRuntimeInstalled();
  const runtimeCommand = commandForRmbg(args);
  const { command, commandArgs } = runtimeCommand;
  const env = options.desktopSession
    ? { ...runtimeCommand.env, ...createDesktopSessionEnv() }
    : runtimeCommand.env;

  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: runtimeCommand.cwd,
      shell: false,
      env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error: Error) => {
      reject(error);
    });

    child.on("close", (code: number) => {
      const rawOut = stdout.trim();
      const rawErr = stderr.trim();

      if (code === 0) {
        try {
          resolve(rawOut ? (JSON.parse(rawOut) as JsonMap) : { ok: true });
        } catch {
          resolve({ ok: true, message: rawOut });
        }
        return;
      }

      const normalized = normalizeCommandFailure({
        command,
        args: commandArgs,
        code,
        stdout,
        stderr,
      });
      reject(
        new Error(
          `[${normalized.kind}] ${normalized.message}${
            normalized.exitCode !== null ? ` (exit ${normalized.exitCode})` : ""
          }`,
        ),
      );
    });
  });
}

function runDesktopRmbg(args: string[]) {
  return runRmbg(args, { desktopSession: true });
}

function createRmbgWorkerClient() {
  let child: ReturnType<typeof spawn> | null = null;
  let buffer = "";
  let nextId = 1;
  let lastClose: { code: number | null; at_ms: number } | null = null;
  let modelLoaded = false;
  let runtimeDevice: string | null = null;
  let runtimeDtype: string | null = null;
  let stderrBuffer = "";
  let startWorkerPromise: Promise<void> | null = null;
  const pending = new Map<
    string,
    { resolve: (value: JsonMap) => void; reject: (reason?: unknown) => void; action: PendingAction }
  >();
  const idleSeconds = Number.parseInt(process.env.RMBG_WORKER_IDLE_SECONDS || "300", 10);

  const rejectAllPending = (error: Error) => {
    for (const { reject } of pending.values()) {
      reject(error);
    }
    pending.clear();
  };

  const appendStderr = (chunk: Buffer) => {
    stderrBuffer += chunk.toString();
    if (stderrBuffer.length > 8000) {
      stderrBuffer = stderrBuffer.slice(stderrBuffer.length - 8000);
    }
  };

  const handleLine = (line: string) => {
    if (!line.trim()) {
      return;
    }

    let message: JsonMap;
    try {
      message = JSON.parse(line) as JsonMap;
    } catch {
      return;
    }

    const id = String(message?.id ?? "");
    const promiseHandlers = pending.get(id);
    if (!promiseHandlers) {
      return;
    }

    pending.delete(id);
    if (message.ok) {
      const result = (message.result as JsonMap | undefined) || { ok: true };
      if (typeof result.model_loaded === "boolean") {
        modelLoaded = result.model_loaded;
      }
      if (typeof result.runtime_device === "string") {
        runtimeDevice = result.runtime_device;
      }
      if (typeof result.runtime_dtype === "string") {
        runtimeDtype = result.runtime_dtype;
      }
      if (promiseHandlers.action === "remove") {
        modelLoaded = true;
      }
      if (promiseHandlers.action === "shutdown") {
        modelLoaded = false;
      }
      promiseHandlers.resolve(result);
    } else {
      const normalized = normalizeWorkerFailure(String(message.error || "rmbg worker request failed"), stderrBuffer);
      promiseHandlers.reject(new Error(`[${normalized.kind}] ${normalized.message}`));
    }
  };

  const startWorker = async () => {
    if (child && !child.killed) {
      return;
    }
    if (startWorkerPromise) {
      return startWorkerPromise;
    }

    startWorkerPromise = (async () => {
      await ensureDesktopRuntimeInstalled();
      const { command, commandArgs, cwd, env } = commandForRmbg([
        "worker",
        "--idle-seconds",
        String(Number.isFinite(idleSeconds) ? idleSeconds : 300),
        "--surface",
        "desktop",
      ]);

      child = spawn(command, commandArgs, {
        cwd,
        shell: false,
        env: { ...env, ...createDesktopSessionEnv() },
      });

      buffer = "";
      stderrBuffer = "";
      modelLoaded = false;
      runtimeDevice = null;
      runtimeDtype = null;

      child.stdout.on("data", (chunk: Buffer) => {
        buffer += chunk.toString();
        let newlineIndex = buffer.indexOf("\n");
        while (newlineIndex >= 0) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          handleLine(line);
          newlineIndex = buffer.indexOf("\n");
        }
      });

      child.stderr.on("data", (chunk: Buffer) => {
        appendStderr(chunk);
      });

      child.on("error", (error: Error) => {
        rejectAllPending(error);
        child = null;
      });

      child.on("close", (code: number | null) => {
        if (pending.size > 0) {
          const normalized = normalizeWorkerFailure(`rmbg worker exited with code ${code}`, stderrBuffer);
          rejectAllPending(new Error(`[${normalized.kind}] ${normalized.message}`));
        }
        lastClose = {
          code,
          at_ms: Date.now(),
        };
        modelLoaded = false;
        runtimeDevice = null;
        runtimeDtype = null;
        child = null;
      });
    })();

    try {
      await startWorkerPromise;
    } finally {
      startWorkerPromise = null;
    }
  };

  const request = async (action: PendingAction, payload: JsonMap = {}, options: { ensureWorker?: boolean } = {}) => {
    const ensureWorker = options.ensureWorker !== false;
    if (ensureWorker) {
      await startWorker();
    }

    return new Promise<JsonMap>((resolve, reject) => {
      if (!child || child.killed || !child.stdin.writable) {
        reject(new Error("rmbg worker is not available"));
        return;
      }

      const id = String(nextId++);
      pending.set(id, { resolve, reject, action });

      const message = JSON.stringify({ id, action, payload }) + "\n";
      try {
        child.stdin.write(message, (error?: Error | null) => {
          if (!error) {
            return;
          }
          pending.delete(id);
          reject(error);
        });
      } catch (error) {
        pending.delete(id);
        reject(error);
      }
    });
  };

  const status = async () => {
    const base = {
      model_loaded: modelLoaded,
      pending_requests: pending.size,
      idle_seconds: Number.isFinite(idleSeconds) ? idleSeconds : 300,
      last_close: lastClose,
      runtime_device: runtimeDevice,
      runtime_dtype: runtimeDtype,
    };

    if (!child || child.killed) {
      return {
        running: false,
        ...base,
      };
    }

    return {
      running: true,
      ...base,
    };
  };

  return { request, status };
}

const workerClient = createRmbgWorkerClient();

function ensureStorageDir() {
  fs.mkdirSync(storageDir, { recursive: true });
}

function defaultOutputPath(inputPath: string) {
  if (isHttpUrl(inputPath)) {
    ensureStorageDir();
    return path.join(storageDir, `${inputBaseName(inputPath)}_rmbg.png`);
  }

  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}_rmbg.png`);
}

function defaultSuggestedSavePath(inputPath: string) {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}_rmbg.png`);
}

async function requireDesktopLicense() {
  const desktop = await runRmbg(["license", "status", "--surface", "desktop", "--json"]);
  if (!desktop?.ok || !desktop?.licensed) {
    throw new Error(String(desktop?.message || "App key activation is required"));
  }
}

async function combinedLicenseStatus() {
  const [desktop, cli] = await Promise.all([
    runRmbg(["license", "status", "--surface", "desktop", "--json"]),
    runRmbg(["license", "status", "--surface", "cli", "--json"]).catch(() => null),
  ]);

  return {
    ok: true,
    desktop,
    cli,
    ready: Boolean(desktop?.licensed),
  };
}

ipcMain.handle("scan-storage", () => {
  const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
  ensureStorageDir();

  let entries: string[];
  try {
    entries = fs.readdirSync(storageDir);
  } catch {
    return [];
  }

  const originals = entries.filter((e) => {
    if (e.endsWith("_rmbg.png")) return false;
    return IMAGE_EXTS.has(path.extname(e).toLowerCase());
  });

  const results = originals.map((entry) => {
    const originalPath = path.join(storageDir, entry);
    const stem = path.parse(entry).name;
    const processedPath = path.join(storageDir, `${stem}_rmbg.png`);
    return {
      name: entry,
      originalPath,
      processedPath: fs.existsSync(processedPath) ? processedPath : null,
    };
  });

  results.sort((a, b) => {
    try {
      return fs.statSync(a.originalPath).mtimeMs - fs.statSync(b.originalPath).mtimeMs;
    } catch {
      return 0;
    }
  });

  return results;
});

ipcMain.handle("copy-to-storage", async (_event: unknown, payload: { sourcePath?: string }) => {
  const sourcePath = normalizeUserPath(payload?.sourcePath);
  ensureStorageDir();

  const filename = path.basename(sourcePath);
  let destPath = path.join(storageDir, filename);

  if (sourcePath === destPath) {
    return { ok: true, path: destPath, name: path.basename(destPath) };
  }

  if (fs.existsSync(destPath)) {
    const { name, ext } = path.parse(filename);
    let counter = 1;
    while (fs.existsSync(destPath)) {
      destPath = path.join(storageDir, `${name} ${counter}${ext}`);
      counter++;
    }
  }

  await fs.promises.copyFile(sourcePath, destPath);
  return { ok: true, path: destPath, name: path.basename(destPath) };
});

ipcMain.handle("get-storage-dir", () => {
  ensureStorageDir();
  return storageDir;
});

ipcMain.handle("pick-images", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }],
  });

  if (result.canceled) {
    return [];
  }

  return result.filePaths;
});

ipcMain.handle("library-list", async () => {
  const state = readLibraryState();
  const items = normalizeLibraryItems(state.items).sort((a, b) => b.created_at - a.created_at);
  writeLibraryState({ version: 1, items });
  return {
    ok: true,
    folder_path: libraryRootDir(),
    items,
  };
});

ipcMain.handle("library-import-files", async (_event: unknown, payload: { paths?: string[] }) => {
  await requireDesktopLicense();
  const paths = Array.isArray(payload?.paths) ? payload.paths : [];
  if (paths.length === 0) {
    return {
      ok: true,
      imported: [],
      items: readLibraryState().items,
    };
  }

  const imported: LibraryItem[] = [];
  for (const filePath of paths) {
    imported.push(await importLocalFileIntoLibrary(filePath));
  }
  const items = upsertLibraryItems(imported);
  return {
    ok: true,
    imported,
    items,
  };
});

ipcMain.handle("library-import-url", async (_event: unknown, payload: { url?: string }) => {
  await requireDesktopLicense();
  const url = String(payload?.url || "").trim();
  if (!url) {
    throw new Error("url is required");
  }

  const imported = await importUrlIntoLibrary(url);
  const items = upsertLibraryItems([imported]);
  return {
    ok: true,
    imported,
    items,
  };
});

ipcMain.handle("library-import-clipboard-image", async (_event: unknown, payload: LibraryImportClipboardImagePayload) => {
  await requireDesktopLicense();
  const imported = await importClipboardImageIntoLibrary(payload);
  const items = upsertLibraryItems([imported]);
  return {
    ok: true,
    imported,
    items,
  };
});

ipcMain.handle("library-process", async (_event: unknown, payload: { id?: string }) => {
  await requireDesktopLicense();
  const id = String(payload?.id || "").trim();
  if (!id) {
    throw new Error("id is required");
  }

  const state = readLibraryState();
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error("Image not found in library");
  }

  const outputPath = libraryOutputPathFor(item.id);
  const result = await workerClient.request("remove", {
    input_path: item.source_path,
    output_path: outputPath,
  });

  const updated: LibraryItem = {
    ...item,
    output_path: outputPath,
    processed_at: Date.now(),
  };

  const items = upsertLibraryItems([updated]);
  return {
    ok: true,
    result,
    item: updated,
    items,
  };
});

ipcMain.handle("library-delete", async (_event: unknown, payload: { id?: string }) => {
  await requireDesktopLicense();
  const id = String(payload?.id || "").trim();
  if (!id) {
    throw new Error("id is required");
  }

  const items = await removeLibraryItem(id);
  return {
    ok: true,
    deleted_id: id,
    items,
  };
});

ipcMain.handle("open-library-folder", async () => {
  ensureLibraryDirs();
  shell.openPath(libraryRootDir());
  return { ok: true, folder_path: libraryRootDir() };
});

ipcMain.handle("ensure-runtime", async () => {
  const runtimePath = await ensureDesktopRuntimeInstalled();
  return { ok: true, runtime_path: runtimePath };
});

ipcMain.handle("open-runtime-install-url", async () => {
  await shell.openExternal(RMBG_INSTALL_URL);
  return { ok: true, url: RMBG_INSTALL_URL };
});

ipcMain.handle(
  "save-processed-image",
  async (_event: unknown, payload: { sourcePath?: string; inputPath?: string }) => {
    const sourcePath = normalizeUserPath(payload?.sourcePath);
    const inputPath = String(payload?.inputPath || "").trim();
    if (!inputPath) {
      throw new Error("inputPath is required");
    }
    if (!fs.existsSync(sourcePath)) {
      throw new Error("Processed image file is missing. Run Remove BG again.");
    }

    const saveResult = await dialog.showSaveDialog({
      defaultPath: defaultSuggestedSavePath(inputPath),
      filters: [{ name: "PNG image", extensions: ["png"] }],
      properties: ["showOverwriteConfirmation", "createDirectory"],
    });

    if (saveResult.canceled || !saveResult.filePath) {
      return { ok: false, canceled: true };
    }

    const destinationPath = normalizeUserPath(saveResult.filePath);
    await fs.promises.copyFile(sourcePath, destinationPath);
    return {
      ok: true,
      output_path: destinationPath,
    };
  },
);

function decodeImageBytes(input: unknown): Buffer {
  if (input instanceof Uint8Array) {
    return Buffer.from(input);
  }
  if (Array.isArray(input)) {
    return Buffer.from(input as number[]);
  }
  if (input && typeof input === "object" && "byteLength" in (input as ArrayBuffer)) {
    return Buffer.from(new Uint8Array(input as ArrayBuffer));
  }
  throw new Error("Image bytes payload is missing or unreadable.");
}

ipcMain.handle(
  "save-image-bytes",
  async (
    _event: unknown,
    payload: { bytes?: ArrayBuffer | Uint8Array | number[]; inputPath?: string; suffix?: string },
  ) => {
    const buffer = decodeImageBytes(payload?.bytes);
    const inputPath = String(payload?.inputPath || "").trim();
    if (!inputPath) {
      throw new Error("inputPath is required");
    }

    const suffix = String(payload?.suffix || "text-behind").replace(/[^a-z0-9-_]/gi, "") || "edit";
    const baseSuggested = defaultSuggestedSavePath(inputPath);
    const parsed = path.parse(baseSuggested);
    const suggested = path.join(parsed.dir, `${parsed.name}-${suffix}.png`);

    const saveResult = await dialog.showSaveDialog({
      defaultPath: suggested,
      filters: [{ name: "PNG image", extensions: ["png"] }],
      properties: ["showOverwriteConfirmation", "createDirectory"],
    });

    if (saveResult.canceled || !saveResult.filePath) {
      return { ok: false, canceled: true };
    }

    const destinationPath = normalizeUserPath(saveResult.filePath);
    await fs.promises.writeFile(destinationPath, buffer);
    return {
      ok: true,
      output_path: destinationPath,
    };
  },
);

ipcMain.handle(
  "copy-image-bytes",
  async (_event: unknown, payload: { bytes?: ArrayBuffer | Uint8Array | number[] }) => {
    const buffer = decodeImageBytes(payload?.bytes);
    const image = nativeImage.createFromBuffer(buffer);
    if (image.isEmpty()) {
      throw new Error("Composed image could not be copied.");
    }
    clipboard.writeImage(image);
    return { ok: true };
  },
);

ipcMain.handle("copy-processed-image", async (_event: unknown, payload: { sourcePath?: string }) => {
  const sourcePath = normalizeUserPath(payload?.sourcePath);
  if (!fs.existsSync(sourcePath)) {
    throw new Error("Processed image file is missing. Run Remove BG again.");
  }

  const image = nativeImage.createFromPath(sourcePath);
  if (image.isEmpty()) {
    throw new Error("Processed image could not be copied.");
  }

  clipboard.writeImage(image);
  return { ok: true };
});

ipcMain.handle("open-in-folder", async (_event: unknown, payload: { filePath?: string }) => {
  const filePath = normalizeUserPath(payload?.filePath);
  if (!fs.existsSync(filePath)) {
    throw new Error("Output file is missing");
  }

  shell.showItemInFolder(filePath);
  return { ok: true };
});

ipcMain.handle("model-status", async () => runRmbg(["model", "status", "--json"]));
ipcMain.handle("worker-status", async () => workerClient.status());

ipcMain.handle("ensure-model", async () => {
  await requireDesktopLicense();
  await runDesktopRmbg(["model", "ensure", "--surface", "desktop", "--json"]);

  const result = await workerClient.request("ensure_model", {});
  return {
    ok: true,
    ...result,
  };
});

ipcMain.handle("license-status", async () => combinedLicenseStatus());

ipcMain.handle("license-activate", async (_event: unknown, payload: { key?: string; surface?: string }) => {
  const key = String(payload?.key || "").trim();
  const surface = String(payload?.surface || "").trim();
  if (!key) {
    throw new Error("License key is required");
  }
  if (surface !== "desktop" && surface !== "cli") {
    throw new Error("surface must be 'desktop' or 'cli'");
  }

  return runRmbg([
    "license",
    "activate",
    "--key",
    key,
    "--surface",
    surface,
    "--json",
  ], { desktopSession: surface === "desktop" });
});

ipcMain.handle("license-refresh", async (_event: unknown, payload: { surface?: string }) => {
  const surface = String(payload?.surface || "").trim();
  if (surface !== "desktop" && surface !== "cli") {
    throw new Error("surface must be 'desktop' or 'cli'");
  }
  return runRmbg(["license", "refresh", "--surface", surface, "--json"], {
    desktopSession: surface === "desktop",
  });
});

ipcMain.handle(
  "remove-background",
  async (_event: unknown, payload: { inputPath?: string; outputPath?: string }) => {
    await requireDesktopLicense();

    const normalizedInput = normalizeInputReference(payload?.inputPath);
    const outputPath = payload?.outputPath
      ? normalizeUserPath(payload.outputPath)
      : defaultOutputPath(normalizedInput);

    const result = await workerClient.request("remove", {
      input_path: normalizedInput,
      output_path: outputPath,
    });

    return {
      ok: true,
      ...result,
    };
  },
);

app.whenReady().then(() => {
  createWindow();
  void ensureDesktopRuntimeInstalled().catch((error: Error) => {
    console.warn(String(error?.message || error));
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
