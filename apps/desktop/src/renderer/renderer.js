const gallery = document.getElementById("gallery");
const emptyState = document.getElementById("empty-state");
const addImagesBtn = document.getElementById("add-images-btn");
const ensureModelBtn = document.getElementById("ensure-model-btn");
const modelStatusEl = document.getElementById("model-status");
const workerStatusEl = document.getElementById("worker-status");
const appLicenseStatusEl = document.getElementById("app-license-status");
const cliLicenseStatusEl = document.getElementById("cli-license-status");
const globalStatusEl = document.getElementById("global-status");
const cardTemplate = document.getElementById("card-template");

const appLicenseInput = document.getElementById("app-license-key-input");
const appActivateBtn = document.getElementById("app-license-activate-btn");
const appRefreshBtn = document.getElementById("app-license-refresh-btn");

const cliLicenseInput = document.getElementById("cli-license-key-input");
const cliActivateBtn = document.getElementById("cli-license-activate-btn");
const cliRefreshBtn = document.getElementById("cli-license-refresh-btn");

function setGlobalStatus(message) {
  globalStatusEl.textContent = message;
}

function setModelStatus(message) {
  modelStatusEl.textContent = message;
}

function setWorkerStatus(message) {
  workerStatusEl.textContent = message;
}

function setSurfaceStatus(el, label, status) {
  if (!status || !status.ok) {
    el.textContent = `${label}: unknown`;
    return;
  }

  if (status.licensed) {
    el.textContent =
      status.phase === "grace" ? `${label}: grace window` : `${label}: active`;
    return;
  }

  if (status.phase === "missing") {
    el.textContent = `${label}: not activated`;
    return;
  }

  el.textContent = `${label}: invalid`;
}

function updateEmptyState() {
  emptyState.classList.toggle("hidden", gallery.children.length > 0);
}

function toFileUrl(filePath) {
  return `file://${encodeURI(filePath)}`;
}

function setCardState(card, state) {
  const stateEl = card.querySelector(".state");
  stateEl.textContent = state;
}

function createCard(filePath) {
  const fragment = cardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".card");
  const filename = card.querySelector(".filename");
  const before = card.querySelector(".img-before");
  const after = card.querySelector(".img-after");
  const slider = card.querySelector(".slider");
  const overlay = card.querySelector(".overlay");
  const processBtn = card.querySelector(".process-btn");
  const saveBtn = card.querySelector(".save-btn");

  const name = filePath.split("/").pop() || filePath;
  filename.textContent = name;
  before.src = toFileUrl(filePath);
  after.src = toFileUrl(filePath);

  let outputPath = null;

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

      outputPath = result.output_path;
      after.src = `${toFileUrl(outputPath)}?v=${Date.now()}`;
      setCardState(card, "Done");
      saveBtn.disabled = false;
      setGlobalStatus("Ready");
    } catch (error) {
      setCardState(card, "Failed");
      setGlobalStatus(error.message || "Processing failed");
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

  gallery.appendChild(card);
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
    } catch (error) {
      setGlobalStatus(error.message || `Activation failed for ${label}`);
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
    } catch (error) {
      setGlobalStatus(error.message || `Refresh failed for ${label}`);
    } finally {
      refreshButton.disabled = false;
      await refreshLicenseStatus();
      await refreshWorkerStatus();
    }
  });
}

addImagesBtn.addEventListener("click", async () => {
  const files = await window.rmbg.pickImages();
  files.forEach((filePath) => createCard(filePath));
});

ensureModelBtn.addEventListener("click", async () => {
  ensureModelBtn.disabled = true;
  setGlobalStatus("Ensuring model files...");

  try {
    const result = await window.rmbg.ensureModel();
    if (!result?.ok) {
      throw new Error(result?.error || "Model ensure failed");
    }
    setGlobalStatus(result.bootstrapped ? "Model downloaded and ready" : "Model already ready");
  } catch (error) {
    setGlobalStatus(error.message || "Model ensure failed");
  } finally {
    ensureModelBtn.disabled = false;
    await refreshModelStatus();
    await refreshLicenseStatus();
    await refreshWorkerStatus();
  }
});

wireLicenseControls({
  surface: "desktop",
  label: "App key",
  input: appLicenseInput,
  activateButton: appActivateBtn,
  refreshButton: appRefreshBtn,
});

wireLicenseControls({
  surface: "cli",
  label: "CLI key",
  input: cliLicenseInput,
  activateButton: cliActivateBtn,
  refreshButton: cliRefreshBtn,
});

refreshModelStatus();
refreshLicenseStatus();
refreshWorkerStatus();
updateEmptyState();

setInterval(() => {
  refreshWorkerStatus();
}, 5000);
