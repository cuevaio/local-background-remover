const gallery = document.getElementById("gallery");
const emptyState = document.getElementById("empty-state");
const addImagesBtn = document.getElementById("add-images-btn") as HTMLButtonElement | null;
const ensureModelBtn = document.getElementById("ensure-model-btn") as HTMLButtonElement | null;
const modelStatusEl = document.getElementById("model-status");
const workerStatusEl = document.getElementById("worker-status");
const appLicenseStatusEl = document.getElementById("app-license-status");
const cliLicenseStatusEl = document.getElementById("cli-license-status");
const globalStatusEl = document.getElementById("global-status");
const cardTemplate = document.getElementById("card-template") as HTMLTemplateElement | null;

const appLicenseInput = document.getElementById("app-license-key-input") as HTMLInputElement | null;
const appActivateBtn = document.getElementById("app-license-activate-btn") as HTMLButtonElement | null;
const appRefreshBtn = document.getElementById("app-license-refresh-btn") as HTMLButtonElement | null;

const cliLicenseInput = document.getElementById("cli-license-key-input") as HTMLInputElement | null;
const cliActivateBtn = document.getElementById("cli-license-activate-btn") as HTMLButtonElement | null;
const cliRefreshBtn = document.getElementById("cli-license-refresh-btn") as HTMLButtonElement | null;

function required<T>(value: T | null, label: string): T {
  if (!value) {
    throw new Error(`Missing required DOM element: ${label}`);
  }
  return value;
}

function setGlobalStatus(message: string) {
  required(globalStatusEl, "global-status").textContent = message;
}

function setModelStatus(message: string) {
  required(modelStatusEl, "model-status").textContent = message;
}

function setWorkerStatus(message: string) {
  required(workerStatusEl, "worker-status").textContent = message;
}

function setSurfaceStatus(el: HTMLElement | null, label: string, status: LicenseResponse | null | undefined) {
  const target = required(el, `${label} status`);
  if (!status || !status.ok) {
    target.textContent = `${label}: unknown`;
    return;
  }

  if (status.licensed) {
    target.textContent = status.phase === "grace" ? `${label}: grace window` : `${label}: active`;
    return;
  }

  if (status.phase === "missing") {
    target.textContent = `${label}: not activated`;
    return;
  }

  target.textContent = `${label}: invalid`;
}

function updateEmptyState() {
  const target = required(emptyState, "empty-state");
  target.classList.toggle("hidden", required(gallery, "gallery").children.length > 0);
}

function toFileUrl(filePath: string) {
  return `file://${encodeURI(filePath)}`;
}

function setCardState(card: Element, state: string) {
  const stateEl = card.querySelector(".state");
  if (stateEl) {
    stateEl.textContent = state;
  }
}

function createCard(filePath: string) {
  const template = required(cardTemplate, "card-template");
  const fragment = template.content.cloneNode(true);
  const card = (fragment as DocumentFragment).querySelector(".card");
  if (!card) {
    return;
  }

  const filename = required(card.querySelector(".filename"), "card filename");
  const before = required(card.querySelector(".img-before"), "before image") as HTMLImageElement;
  const after = required(card.querySelector(".img-after"), "after image") as HTMLImageElement;
  const slider = required(card.querySelector(".slider"), "compare slider") as HTMLInputElement;
  const overlay = required(card.querySelector(".overlay"), "compare overlay") as HTMLElement;
  const processBtn = required(card.querySelector(".process-btn"), "process button") as HTMLButtonElement;
  const saveBtn = required(card.querySelector(".save-btn"), "save button") as HTMLButtonElement;

  const name = filePath.split("/").pop() || filePath;
  filename.textContent = name;
  before.src = toFileUrl(filePath);
  after.src = toFileUrl(filePath);

  let outputPath: string | null = null;

  slider.addEventListener("input", () => {
    overlay.style.width = `${slider.value}%`;
  });

  processBtn.addEventListener("click", async () => {
    processBtn.disabled = true;
    setCardState(card, "Processing...");
    setGlobalStatus(`Removing background for ${name}`);

    try {
      const result = await window.rmbg.removeBackground({ inputPath: filePath });
      if (!result?.ok) {
        throw new Error(result?.error || "Unknown processing error");
      }

      outputPath = result.output_path || null;
      if (!outputPath) {
        throw new Error("Missing output path from processing response");
      }
      after.src = `${toFileUrl(outputPath)}?v=${Date.now()}`;
      setCardState(card, "Done");
      saveBtn.disabled = false;
      setGlobalStatus("Ready");
    } catch (error: unknown) {
      setCardState(card, "Failed");
      const message = error instanceof Error ? error.message : "Processing failed";
      setGlobalStatus(message);
    } finally {
      processBtn.disabled = false;
      await refreshLicenseStatus();
      await refreshWorkerStatus();
    }
  });

  saveBtn.addEventListener("click", () => {
    if (!outputPath) {
      return;
    }
    setGlobalStatus(`Saved: ${outputPath}`);
  });

  required(gallery, "gallery").appendChild(card);
  updateEmptyState();
}

async function refreshModelStatus() {
  try {
    const status = await window.rmbg.modelStatus();
    if (status.ready) {
      setModelStatus("Model: ready (local)");
    } else {
      setModelStatus("Model: missing");
    }
  } catch {
    setModelStatus("Model: unknown");
  }
}

async function refreshWorkerStatus() {
  try {
    const status = await window.rmbg.workerStatus();
    if (!status?.running) {
      setWorkerStatus("Worker: sleeping");
      return;
    }

    if (status.model_loaded) {
      const device = status.runtime_device ? status.runtime_device.toUpperCase() : "?";
      setWorkerStatus(`Worker: warm (${device})`);
      return;
    }

    setWorkerStatus("Worker: active");
  } catch {
    setWorkerStatus("Worker: unknown");
  }
}

async function refreshLicenseStatus() {
  try {
    const status = await window.rmbg.licenseStatus();
    setSurfaceStatus(appLicenseStatusEl, "App key", status?.desktop);
    setSurfaceStatus(cliLicenseStatusEl, "CLI key", status?.cli);
    setGlobalStatus(status?.ready ? "Ready" : "Activate both keys to process images");
  } catch {
    setSurfaceStatus(appLicenseStatusEl, "App key", null);
    setSurfaceStatus(cliLicenseStatusEl, "CLI key", null);
  }
}

function wireLicenseControls({
  surface,
  label,
  input,
  activateButton,
  refreshButton,
}: {
  surface: LicenseSurface;
  label: string;
  input: HTMLInputElement;
  activateButton: HTMLButtonElement;
  refreshButton: HTMLButtonElement;
}) {
  activateButton.addEventListener("click", async () => {
    const key = input.value.trim();
    if (!key) {
      setGlobalStatus(`Paste your ${label} first`);
      return;
    }

    activateButton.disabled = true;
    setGlobalStatus(`Activating ${label}...`);
    try {
      const result = await window.rmbg.licenseActivate({ key, surface });
      if (!result?.ok) {
        throw new Error(result?.error || `Activation failed for ${label}`);
      }
      input.value = "";
      setGlobalStatus(`${label} activated`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Activation failed for ${label}`;
      setGlobalStatus(message);
    } finally {
      activateButton.disabled = false;
      await refreshLicenseStatus();
      await refreshWorkerStatus();
    }
  });

  refreshButton.addEventListener("click", async () => {
    refreshButton.disabled = true;
    setGlobalStatus(`Refreshing ${label}...`);
    try {
      const result = await window.rmbg.licenseRefresh({ surface });
      if (!result?.ok) {
        throw new Error(result?.error || `Refresh failed for ${label}`);
      }
      setGlobalStatus(`${label} refreshed`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : `Refresh failed for ${label}`;
      setGlobalStatus(message);
    } finally {
      refreshButton.disabled = false;
      await refreshLicenseStatus();
      await refreshWorkerStatus();
    }
  });
}

required(addImagesBtn, "add-images-btn").addEventListener("click", async () => {
  const files = await window.rmbg.pickImages();
  files.forEach((filePath) => createCard(filePath));
});

required(ensureModelBtn, "ensure-model-btn").addEventListener("click", async () => {
  const button = required(ensureModelBtn, "ensure-model-btn");
  button.disabled = true;
  setGlobalStatus("Ensuring model files...");

  try {
    const result = await window.rmbg.ensureModel();
    if (!result?.ok) {
      throw new Error(result?.error || "Model ensure failed");
    }
    setGlobalStatus(result.bootstrapped ? "Model downloaded and ready" : "Model already ready");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Model ensure failed";
    setGlobalStatus(message);
  } finally {
    button.disabled = false;
    await refreshModelStatus();
    await refreshLicenseStatus();
    await refreshWorkerStatus();
  }
});

wireLicenseControls({
  surface: "desktop",
  label: "App key",
  input: required(appLicenseInput, "app-license-key-input"),
  activateButton: required(appActivateBtn, "app-license-activate-btn"),
  refreshButton: required(appRefreshBtn, "app-license-refresh-btn"),
});

wireLicenseControls({
  surface: "cli",
  label: "CLI key",
  input: required(cliLicenseInput, "cli-license-key-input"),
  activateButton: required(cliActivateBtn, "cli-license-activate-btn"),
  refreshButton: required(cliRefreshBtn, "cli-license-refresh-btn"),
});

refreshModelStatus();
refreshLicenseStatus();
refreshWorkerStatus();
updateEmptyState();

setInterval(() => {
  void refreshWorkerStatus();
}, 5000);
