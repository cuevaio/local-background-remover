const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "../../../../");
const rmbgProjectDir = path.join(repoRoot, "apps", "rmbg");
const rmbgBin = path.join(rmbgProjectDir, ".venv", "bin", "rmbg");

function normalizeUserPath(filePath) {
  if (typeof filePath !== "string" || !filePath.trim()) {
    throw new Error("Path is required");
  }
  return path.normalize(path.resolve(filePath));
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

function commandForRmbg(args) {
  if (fs.existsSync(rmbgBin)) {
    return { command: rmbgBin, commandArgs: args };
  }

  return {
    command: "uv",
    commandArgs: ["run", "--project", rmbgProjectDir, "rmbg", ...args],
  };
}

function runRmbg(args) {
  const { command, commandArgs } = commandForRmbg(args);

  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: repoRoot,
      shell: false,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      const rawOut = stdout.trim();
      const rawErr = stderr.trim();

      if (code === 0) {
        try {
          resolve(rawOut ? JSON.parse(rawOut) : { ok: true });
        } catch {
          resolve({ ok: true, message: rawOut });
        }
        return;
      }

      reject(new Error(rawErr || rawOut || `rmbg exited with code ${code}`));
    });
  });
}

function createRmbgWorkerClient() {
  let child = null;
  let buffer = "";
  let nextId = 1;
  let lastClose = null;
  let modelLoaded = false;
  let runtimeDevice = null;
  let runtimeDtype = null;
  const pending = new Map();
  const idleSeconds = Number.parseInt(process.env.RMBG_WORKER_IDLE_SECONDS || "300", 10);

  const rejectAllPending = (error) => {
    for (const { reject } of pending.values()) {
      reject(error);
    }
    pending.clear();
  };

  const handleLine = (line) => {
    if (!line.trim()) {
      return;
    }

    let message;
    try {
      message = JSON.parse(line);
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
      const result = message.result || { ok: true };
      if (typeof result.model_loaded === "boolean") {
        modelLoaded = result.model_loaded;
      }
      if (result.runtime_device) {
        runtimeDevice = result.runtime_device;
      }
      if (result.runtime_dtype) {
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
      promiseHandlers.reject(new Error(message.error || "rmbg worker request failed"));
    }
  };

  const startWorker = () => {
    if (child && !child.killed) {
      return;
    }

    const { command, commandArgs } = commandForRmbg([
      "worker",
      "--idle-seconds",
      String(Number.isFinite(idleSeconds) ? idleSeconds : 300),
    ]);

    child = spawn(command, commandArgs, {
      cwd: repoRoot,
      shell: false,
      env: process.env,
    });

    buffer = "";
    modelLoaded = false;
    runtimeDevice = null;
    runtimeDtype = null;

    child.stdout.on("data", (chunk) => {
      buffer += chunk.toString();
      let newlineIndex = buffer.indexOf("\n");
      while (newlineIndex >= 0) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        handleLine(line);
        newlineIndex = buffer.indexOf("\n");
      }
    });

    child.on("error", (error) => {
      rejectAllPending(error);
      child = null;
    });

    child.on("close", (code) => {
      if (pending.size > 0) {
        rejectAllPending(new Error(`rmbg worker exited with code ${code}`));
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
  };

  const request = (action, payload = {}, options = {}) => {
    const ensureWorker = options.ensureWorker !== false;
    if (ensureWorker) {
      startWorker();
    }

    return new Promise((resolve, reject) => {
      if (!child || child.killed || !child.stdin.writable) {
        reject(new Error("rmbg worker is not available"));
        return;
      }

      const id = String(nextId++);
      pending.set(id, { resolve, reject, action });

      const message = JSON.stringify({ id, action, payload }) + "\n";
      try {
        child.stdin.write(message, (error) => {
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
    if (!child || child.killed) {
      return {
        running: false,
        model_loaded: modelLoaded,
        pending_requests: pending.size,
        idle_seconds: Number.isFinite(idleSeconds) ? idleSeconds : 300,
        last_close: lastClose,
        runtime_device: runtimeDevice,
        runtime_dtype: runtimeDtype,
      };
    }

    return {
      running: true,
      model_loaded: modelLoaded,
      pending_requests: pending.size,
      idle_seconds: Number.isFinite(idleSeconds) ? idleSeconds : 300,
      last_close: lastClose,
      runtime_device: runtimeDevice,
      runtime_dtype: runtimeDtype,
    };
  };

  return { request, status };
}

const workerClient = createRmbgWorkerClient();

function defaultOutputPath(inputPath) {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}_rmbg.png`);
}

async function requireDesktopLicense() {
  const [desktop, cli] = await Promise.all([
    runRmbg(["license", "status", "--surface", "desktop", "--json"]),
    runRmbg(["license", "status", "--surface", "cli", "--json"]),
  ]);

  if (!desktop?.ok || !desktop?.licensed) {
    throw new Error(desktop?.message || "App key activation is required");
  }

  if (!cli?.ok || !cli?.licensed) {
    throw new Error(cli?.message || "CLI key activation is required");
  }
}

async function combinedLicenseStatus() {
  const [desktop, cli] = await Promise.all([
    runRmbg(["license", "status", "--surface", "desktop", "--json"]),
    runRmbg(["license", "status", "--surface", "cli", "--json"]),
  ]);

  return {
    ok: true,
    desktop,
    cli,
    ready: Boolean(desktop?.licensed && cli?.licensed),
  };
}

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

ipcMain.handle("model-status", async () => runRmbg(["model", "status", "--json"]));
ipcMain.handle("worker-status", async () => workerClient.status());

ipcMain.handle("ensure-model", async () => {
  await requireDesktopLicense();
  await runRmbg([
    "model",
    "ensure",
    "--surface",
    "cli",
    "--require-surface",
    "desktop",
    "--json",
  ]);

  const result = await workerClient.request("ensure_model", {});
  return {
    ok: true,
    ...result,
  };
});

ipcMain.handle("license-status", async () => combinedLicenseStatus());

ipcMain.handle("license-activate", async (_event, payload) => {
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
  ]);
});

ipcMain.handle("license-refresh", async (_event, payload) => {
  const surface = String(payload?.surface || "").trim();
  if (surface !== "desktop" && surface !== "cli") {
    throw new Error("surface must be 'desktop' or 'cli'");
  }
  return runRmbg(["license", "refresh", "--surface", surface, "--json"]);
});

ipcMain.handle("remove-background", async (_event, payload) => {
  await requireDesktopLicense();

  const inputPath = payload?.inputPath;
  if (!inputPath) {
    throw new Error("inputPath is required");
  }

  const normalizedInput = normalizeUserPath(inputPath);
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
});

app.whenReady().then(() => {
  createWindow();

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
