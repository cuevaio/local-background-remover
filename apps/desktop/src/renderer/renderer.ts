const onboardingScreen = document.getElementById("onboarding-screen");
const workspaceScreen = document.getElementById("workspace-screen");
const runtimeNotice = document.getElementById("runtime-notice");
const runtimeNoticeMessage = document.getElementById("runtime-notice-message");
const runtimeRetryBtn = document.getElementById("runtime-retry-btn") as HTMLButtonElement | null;
const runtimeInstallBtn = document.getElementById("runtime-install-btn") as HTMLButtonElement | null;

const appLicenseInput = document.getElementById("app-license-key-input") as HTMLInputElement | null;
const appActivateBtn = document.getElementById("app-license-activate-btn") as HTMLButtonElement | null;

const cliNotice = document.getElementById("cli-notice");
const showCliActivationBtn = document.getElementById("show-cli-activation-btn") as HTMLButtonElement | null;
const dismissCliNoticeBtn = document.getElementById("dismiss-cli-notice-btn") as HTMLButtonElement | null;
const cliActivationInline = document.getElementById("cli-activation-inline");
const cliLicenseInput = document.getElementById("cli-license-key-input") as HTMLInputElement | null;
const cliActivateBtn = document.getElementById("cli-license-activate-btn") as HTMLButtonElement | null;

const dropzone = document.getElementById("dropzone");
const selectImagesBtn = document.getElementById("select-images-btn") as HTMLButtonElement | null;
const imageUrlInput = document.getElementById("image-url-input") as HTMLInputElement | null;
const addUrlBtn = document.getElementById("add-url-btn") as HTMLButtonElement | null;
const openLibraryFolderBtn = document.getElementById("open-library-folder-btn") as HTMLButtonElement | null;

const focusEmpty = document.getElementById("focus-empty");
const focusPanel = document.getElementById("focus-panel");
const focusTitle = document.getElementById("focus-title");
const focusState = document.getElementById("focus-state");
const focusBefore = document.getElementById("focus-before") as HTMLImageElement | null;
const focusAfter = document.getElementById("focus-after") as HTMLImageElement | null;
const focusDivider = document.getElementById("focus-divider");
const focusSlider = document.getElementById("focus-slider") as HTMLInputElement | null;
const focusSaveBtn = document.getElementById("focus-save-btn") as HTMLButtonElement | null;
const focusOpenBtn = document.getElementById("focus-open-btn") as HTMLButtonElement | null;
const focusDeleteBtn = document.getElementById("focus-delete-btn") as HTMLButtonElement | null;

const gallery = document.getElementById("gallery");
const emptyState = document.getElementById("empty-state");
const statusLiveEl = document.getElementById("status-live");
const toastRegion = document.getElementById("toast-region");
const cardTemplate = document.getElementById("card-template") as HTMLTemplateElement | null;

let dragDepth = 0;
let cliNoticeDismissed = false;
let libraryItems: LibraryImageItem[] = [];
let activeImageId: string | null = null;
const processingIds = new Set<string>();
let toastCounter = 0;
let runtimeSetupRequired = false;
let clipboardImportInFlight = false;

type ToastTone = "default" | "success" | "error";

type StatusOptions = {
  toast?: boolean;
  tone?: ToastTone;
};

function required<T>(value: T | null, label: string): T {
  if (!value) {
    throw new Error(`Missing required DOM element: ${label}`);
  }
  return value;
}

function dismissToast(toast: HTMLElement) {
  toast.classList.remove("visible");
  window.setTimeout(() => {
    toast.remove();
  }, 180);
}

function showToast(message: string, tone: ToastTone = "default") {
  const region = required(toastRegion, "toast-region");
  const toast = document.createElement("div");
  toastCounter += 1;
  toast.className = `toast toast-${tone}`;
  toast.dataset.toastId = String(toastCounter);
  toast.textContent = message;
  region.appendChild(toast);

  while (region.children.length > 4) {
    const oldest = region.firstElementChild;
    if (!(oldest instanceof HTMLElement)) {
      break;
    }
    dismissToast(oldest);
  }

  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  window.setTimeout(() => {
    if (toast.isConnected) {
      dismissToast(toast);
    }
  }, tone === "error" ? 5200 : 2800);
}

function setGlobalStatus(message: string, options: StatusOptions = {}) {
  const liveRegion = required(statusLiveEl, "status-live");
  liveRegion.textContent = "";
  window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 0);

  if (options.toast === false || !message.trim()) {
    return;
  }

  showToast(message, options.tone || "default");
}

function showRuntimeNotice(message: string) {
  runtimeSetupRequired = true;
  if (runtimeNoticeMessage) {
    runtimeNoticeMessage.textContent = message;
  }
  if (runtimeNotice) {
    runtimeNotice.classList.remove("hidden");
  }
}

function clearRuntimeNotice() {
  runtimeSetupRequired = false;
  if (runtimeNotice) {
    runtimeNotice.classList.add("hidden");
  }
}

function isRuntimeSetupError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("runtime install failed") ||
    lower.includes("failed to download runtime installer") ||
    lower.includes("installed runtime not found") ||
    lower.includes("installed rmbg version") ||
    lower.includes("unable to verify installed rmbg runtime") ||
    lower.includes("configured rmbg runtime not found") ||
    lower.includes("run runtime setup first")
  );
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function toImageSrc(inputPath: string) {
  return isHttpUrl(inputPath) ? inputPath : `file://${encodeURI(inputPath)}`;
}

function sourceName(inputPath: string) {
  if (isHttpUrl(inputPath)) {
    try {
      const parsed = new URL(inputPath);
      return parsed.pathname.split("/").filter(Boolean).pop() || parsed.host;
    } catch {
      return inputPath;
    }
  }
  return inputPath.split("/").pop() || inputPath;
}

function isWorkspaceVisible() {
  return !required(workspaceScreen, "workspace-screen").classList.contains("hidden");
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return true;
  }

  return Boolean(target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true'], [contenteditable='plaintext-only']"));
}

function clipboardImageFile(event: ClipboardEvent) {
  const transfer = event.clipboardData;
  if (!transfer) {
    return null;
  }

  for (const item of Array.from(transfer.items)) {
    if (!item.type.startsWith("image/")) {
      continue;
    }

    const file = item.getAsFile();
    if (file) {
      return file;
    }
  }

  for (const file of Array.from(transfer.files)) {
    if (file.type.startsWith("image/")) {
      return file;
    }
  }

  return null;
}

function isSurfaceLicensed(status: LicenseResponse | undefined) {
  return Boolean(status?.ok && status.licensed);
}

function currentItem() {
  return libraryItems.find((item) => item.id === activeImageId) || null;
}

function applyFocusSlider(value: string) {
  const percent = Number.parseInt(value, 10);
  const clamped = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 50;
  required(focusAfter, "focus-after").style.clipPath = `inset(0 0 0 ${clamped}%)`;
  required(focusDivider, "focus-divider").setAttribute("style", `left: ${clamped}%;`);
}

function updateEmptyState() {
  const hasItems = libraryItems.length > 0;
  required(emptyState, "empty-state").classList.toggle("hidden", hasItems);
}

function renderGallery() {
  const galleryEl = required(gallery, "gallery");
  galleryEl.innerHTML = "";

  for (const item of libraryItems) {
    const fragment = required(cardTemplate, "card-template").content.cloneNode(true) as DocumentFragment;
    const card = fragment.querySelector(".thumb-card") as HTMLElement | null;
    if (!card) {
      continue;
    }

    const filename = card.querySelector(".filename") as HTMLElement | null;
    const state = card.querySelector(".state") as HTMLElement | null;
    const preview = card.querySelector(".thumb-preview") as HTMLImageElement | null;

    if (filename) {
      filename.textContent = item.original_name || sourceName(item.source_path);
    }
    if (state) {
      state.textContent = item.output_path ? "Processed" : "New";
    }
    if (preview) {
      preview.src = toImageSrc(item.output_path || item.source_path);
    }

    if (item.id === activeImageId) {
      card.classList.add("active");
    }

    card.addEventListener("click", () => {
      activeImageId = item.id;
      renderGallery();
      renderFocusPanel();
    });

    galleryEl.appendChild(card);
  }

  updateEmptyState();
}

function renderFocusPanel() {
  const item = currentItem();
  const emptyEl = required(focusEmpty, "focus-empty");
  const panelEl = required(focusPanel, "focus-panel");

  if (!item) {
    emptyEl.classList.remove("hidden");
    panelEl.classList.add("hidden");
    return;
  }

  emptyEl.classList.add("hidden");
  panelEl.classList.remove("hidden");

  required(focusTitle, "focus-title").textContent = item.original_name || sourceName(item.source_path);
  required(focusState, "focus-state").textContent = item.output_path
    ? "Processed"
    : processingIds.has(item.id)
      ? "Processing..."
      : "Queued";

  required(focusBefore, "focus-before").src = toImageSrc(item.source_path);
  required(focusAfter, "focus-after").src = toImageSrc(item.output_path || item.source_path);

  const slider = required(focusSlider, "focus-slider");
  slider.disabled = !item.output_path;
  slider.value = "50";
  applyFocusSlider("50");

  const saveBtn = required(focusSaveBtn, "focus-save-btn");
  const openBtn = required(focusOpenBtn, "focus-open-btn");
  const deleteBtn = required(focusDeleteBtn, "focus-delete-btn");

  saveBtn.classList.toggle("hidden", !item.output_path);
  openBtn.classList.toggle("hidden", !item.output_path);
  deleteBtn.disabled = processingIds.has(item.id);

  if (!runtimeSetupRequired && !item.output_path && !processingIds.has(item.id)) {
    void processActiveItem(item.id);
  }
}

async function retryRuntimeSetup() {
  const retryButton = required(runtimeRetryBtn, "runtime-retry-btn");
  retryButton.disabled = true;
  setGlobalStatus("Setting up runtime...", { toast: false });

  try {
    await window.rmbg.ensureRuntime();
    clearRuntimeNotice();
    await refreshLicenseStatus();
    renderFocusPanel();
    setGlobalStatus("Background removal runtime is ready.", { tone: "success" });
  } catch (error: unknown) {
    const message = humanizeErrorMessage(error, "Unable to set up the background removal runtime.");
    showRuntimeNotice(message);
    setGlobalStatus(message, { tone: "error" });
  } finally {
    retryButton.disabled = false;
  }
}

async function deleteActiveItem() {
  const item = currentItem();
  if (!item) {
    return;
  }
  if (processingIds.has(item.id)) {
    setGlobalStatus("Wait for processing to finish before deleting this image.", { tone: "error" });
    return;
  }

  const confirmed = window.confirm(`Delete ${item.original_name || sourceName(item.source_path)} from your library?`);
  if (!confirmed) {
    return;
  }

  const button = required(focusDeleteBtn, "focus-delete-btn");
  button.disabled = true;

  try {
    const result = await window.rmbg.libraryDelete({ id: item.id });
    libraryItems = Array.isArray(result?.items) ? result.items : libraryItems.filter((candidate) => candidate.id !== item.id);
    activeImageId = libraryItems[0]?.id || null;
    renderGallery();
    renderFocusPanel();
    setGlobalStatus(`${item.original_name || sourceName(item.source_path)} deleted.`, { tone: "success" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to delete image";
    setGlobalStatus(message, { tone: "error" });
  } finally {
    button.disabled = false;
  }
}

function humanizeErrorMessage(error: unknown, fallback: string) {
  const raw = error instanceof Error ? error.message : fallback;
  const message = raw.replace(/^\[[^\]]+\]\s*/, "").trim();
  const lower = message.toLowerCase();

  if (lower.includes("runtime install failed") || lower.includes("failed to download runtime installer")) {
    return "The app could not install the matching rmbg runtime. Check your connection and try setup again.";
  }
  if (lower.includes("installed runtime not found")) {
    return "The app installed rmbg but could not find the binary afterward. Try setup again.";
  }
  if (lower.includes("installed rmbg version")) {
    return "The installed rmbg version does not match this app version. Try setup again to install the matching runtime.";
  }
  if (lower.includes("unable to verify installed rmbg runtime")) {
    return "The app could not verify the installed rmbg runtime. Try setup again.";
  }
  if (lower.includes("configured rmbg runtime not found")) {
    return "The configured custom rmbg runtime path is missing. Update RMBG_DESKTOP_CLI_PATH or retry setup.";
  }
  if (lower.includes("run runtime setup first")) {
    return "This app needs the external rmbg runtime before it can continue. Run setup again.";
  }
  if (lower.includes("not found") || lower.includes("invalid") || lower.includes("404")) {
    return "That key looks invalid. Please check it and try again.";
  }
  if (lower.includes("license api error")) {
    return "We could not validate your key right now. Please try again in a moment.";
  }
  return message || fallback;
}

async function refreshLibrary() {
  const result = await window.rmbg.libraryList();
  libraryItems = Array.isArray(result?.items) ? result.items : [];

  if (!activeImageId || !libraryItems.some((item) => item.id === activeImageId)) {
    activeImageId = libraryItems[0]?.id || null;
  }

  renderGallery();
  renderFocusPanel();
}

async function processLibraryItem(id: string) {
  if (processingIds.has(id)) {
    return;
  }

  const item = libraryItems.find((candidate) => candidate.id === id);
  if (!item || item.output_path) {
    return;
  }

  processingIds.add(id);
  renderGallery();
  renderFocusPanel();

  try {
    const result = await window.rmbg.libraryProcess({ id });
    libraryItems = Array.isArray(result?.items) ? result.items : libraryItems;
    if (result?.item?.id) {
      activeImageId = result.item.id;
    }
    await refreshLibrary();
    setGlobalStatus(`${item.original_name} is ready.`, { tone: "success" });
  } catch (error: unknown) {
    const raw = error instanceof Error ? error.message : "";
    if (isRuntimeSetupError(raw)) {
      showRuntimeNotice(humanizeErrorMessage(error, "Unable to set up the background removal runtime."));
    }
    setGlobalStatus(humanizeErrorMessage(error, "Unable to process this image."), {
      tone: "error",
    });
  } finally {
    processingIds.delete(id);
    renderGallery();
    renderFocusPanel();
  }
}

async function processActiveItem(id: string) {
  await processLibraryItem(id);
}

async function syncFlow(status: LicenseStatusResponse | null) {
  const appLicensed = isSurfaceLicensed(status?.desktop);
  const cliLicensed = isSurfaceLicensed(status?.cli);

  required(onboardingScreen, "onboarding-screen").classList.toggle("hidden", appLicensed);
  required(workspaceScreen, "workspace-screen").classList.toggle("hidden", !appLicensed);

  if (cliNotice) {
    const showNotice = appLicensed && !cliLicensed && !cliNoticeDismissed;
    cliNotice.classList.toggle("hidden", !showNotice);
  }

  if (!appLicensed) {
    setGlobalStatus("Activate your app key to continue.", { toast: false });
    return;
  }

  await refreshLibrary();
  setGlobalStatus("You're all set. Add an image to begin.", { toast: false });
}

async function refreshLicenseStatus() {
  setGlobalStatus("Preparing app...", { toast: false });
  try {
    const status = await window.rmbg.licenseStatus();
    clearRuntimeNotice();
    await syncFlow(status);
  } catch (error: unknown) {
    const raw = error instanceof Error ? error.message : "";
    if (isRuntimeSetupError(raw)) {
      showRuntimeNotice(humanizeErrorMessage(error, "Unable to set up the background removal runtime."));
    }
    await syncFlow(null);
    setGlobalStatus(humanizeErrorMessage(error, "Unable to verify your license right now."), {
      tone: "error",
    });
  }
}

async function activateLicense(surface: LicenseSurface, label: string, input: HTMLInputElement, button: HTMLButtonElement) {
  const key = input.value.trim();
  if (!key) {
    setGlobalStatus(`Paste your ${label} first.`, { tone: "error" });
    return;
  }

  let activated = false;
  button.disabled = true;
  setGlobalStatus(`Activating ${label}...`, { toast: false });

  try {
    const result = await window.rmbg.licenseActivate({ key, surface });
    if (!result?.ok) {
      throw new Error(result?.error || `Activation failed for ${label}`);
    }

    activated = true;
    input.value = "";
    setGlobalStatus(`${label} activated.`, { tone: "success" });
  } catch (error: unknown) {
    const raw = error instanceof Error ? error.message : "";
    if (isRuntimeSetupError(raw)) {
      showRuntimeNotice(humanizeErrorMessage(error, `Unable to set up runtime for ${label}.`));
    }
    setGlobalStatus(humanizeErrorMessage(error, `Activation failed for ${label}`), { tone: "error" });
  } finally {
    button.disabled = false;
    if (activated) {
      await refreshLicenseStatus();
    }
  }
}

async function importFiles(paths: string[]) {
  if (paths.length === 0) {
    return;
  }

  const result = await window.rmbg.libraryImportFiles({ paths });
  libraryItems = Array.isArray(result?.items) ? result.items : libraryItems;
  const imported = Array.isArray(result?.imported) ? result.imported : [];
  if (imported[0]?.id) {
    activeImageId = imported[0].id;
  }
  renderGallery();
  renderFocusPanel();
}

async function addImagesFromPicker() {
  const button = required(selectImagesBtn, "select-images-btn");
  button.disabled = true;
  setGlobalStatus("Opening file picker...", { toast: false });

  try {
    const files = await window.rmbg.pickImages();
    if (files.length === 0) {
      setGlobalStatus("No files selected.", { toast: false });
      return;
    }

    await importFiles(files);
    if (activeImageId) {
      await processLibraryItem(activeImageId);
    }
    setGlobalStatus(`Added ${files.length} image${files.length === 1 ? "" : "s"}.`, { tone: "success" });
  } catch {
    setGlobalStatus("Unable to import those files.", { tone: "error" });
  } finally {
    button.disabled = false;
  }
}

async function addImageFromUrl() {
  const input = required(imageUrlInput, "image-url-input");
  const url = input.value.trim();
  if (!url) {
    setGlobalStatus("Paste an image URL first.", { tone: "error" });
    return;
  }
  if (!isHttpUrl(url)) {
    setGlobalStatus("Please use a valid http(s) image URL.", { tone: "error" });
    return;
  }

  const button = required(addUrlBtn, "add-url-btn");
  button.disabled = true;
  setGlobalStatus("Importing image URL...", { toast: false });
  try {
    const result = await window.rmbg.libraryImportUrl({ url });
    libraryItems = Array.isArray(result?.items) ? result.items : libraryItems;
    if (result?.imported?.id) {
      activeImageId = result.imported.id;
    }
    input.value = "";
    renderGallery();
    renderFocusPanel();
    if (activeImageId) {
      await processLibraryItem(activeImageId);
    }
    setGlobalStatus("Image added.", { tone: "success" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to import URL";
    setGlobalStatus(message, { tone: "error" });
  } finally {
    button.disabled = false;
  }
}

async function importClipboardImage(file: File) {
  if (clipboardImportInFlight) {
    return;
  }

  clipboardImportInFlight = true;
  setGlobalStatus("Importing clipboard image...", { toast: false });

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await window.rmbg.libraryImportClipboardImage({
      bytes,
      contentType: file.type,
      originalName: file.name,
    });
    libraryItems = Array.isArray(result?.items) ? result.items : libraryItems;
    if (result?.imported?.id) {
      activeImageId = result.imported.id;
    }
    renderGallery();
    renderFocusPanel();
    if (activeImageId) {
      await processLibraryItem(activeImageId);
    }
    setGlobalStatus("Clipboard image added.", { tone: "success" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to import clipboard image";
    setGlobalStatus(message, { tone: "error" });
  } finally {
    clipboardImportInFlight = false;
  }
}

function droppedFiles(event: DragEvent) {
  const files: File[] = [];
  const transfer = event.dataTransfer;
  if (!transfer) {
    return files;
  }

  for (const file of Array.from(transfer.files)) {
    files.push(file);
  }

  for (const item of Array.from(transfer.items)) {
    if (item.kind !== "file") {
      continue;
    }

    const file = item.getAsFile();
    if (file) {
      files.push(file);
    }
  }

  return files;
}

function droppedFilePaths(event: DragEvent) {
  const paths = window.rmbg.resolveDroppedFilePaths(droppedFiles(event));
  return Array.from(new Set(paths.filter((filePath) => filePath.trim())));
}

required(appActivateBtn, "app-license-activate-btn").addEventListener("click", async () => {
  await activateLicense(
    "desktop",
    "app key",
    required(appLicenseInput, "app-license-key-input"),
    required(appActivateBtn, "app-license-activate-btn"),
  );
});

if (cliActivateBtn) {
  cliActivateBtn.addEventListener("click", async () => {
    await activateLicense("cli", "CLI key", required(cliLicenseInput, "cli-license-key-input"), cliActivateBtn);
    cliActivationInline?.classList.add("hidden");
  });
}

showCliActivationBtn?.addEventListener("click", () => {
  cliActivationInline?.classList.remove("hidden");
  cliLicenseInput?.focus();
});

dismissCliNoticeBtn?.addEventListener("click", () => {
  cliNoticeDismissed = true;
  cliNotice?.classList.add("hidden");
});

required(selectImagesBtn, "select-images-btn").addEventListener("click", async () => {
  await addImagesFromPicker();
});

required(addUrlBtn, "add-url-btn").addEventListener("click", async () => {
  await addImageFromUrl();
});

required(imageUrlInput, "image-url-input").addEventListener("keydown", async (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    event.preventDefault();
    await addImageFromUrl();
  }
});

required(runtimeRetryBtn, "runtime-retry-btn").addEventListener("click", async () => {
  await retryRuntimeSetup();
});

required(runtimeInstallBtn, "runtime-install-btn").addEventListener("click", async () => {
  await window.rmbg.openRuntimeInstallUrl();
});

required(openLibraryFolderBtn, "open-library-folder-btn").addEventListener("click", async () => {
  await window.rmbg.openLibraryFolder();
});

required(dropzone, "dropzone").addEventListener("click", async (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  if (target?.closest("button") || target?.closest("input")) {
    return;
  }
  await addImagesFromPicker();
});

required(dropzone, "dropzone").addEventListener("dragenter", (event: DragEvent) => {
  event.preventDefault();
  dragDepth += 1;
  required(dropzone, "dropzone").classList.add("dragging");
});

required(dropzone, "dropzone").addEventListener("dragover", (event: DragEvent) => {
  event.preventDefault();
});

required(dropzone, "dropzone").addEventListener("dragleave", (event: DragEvent) => {
  event.preventDefault();
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) {
    required(dropzone, "dropzone").classList.remove("dragging");
  }
});

required(dropzone, "dropzone").addEventListener("drop", async (event: DragEvent) => {
  event.preventDefault();
  dragDepth = 0;
  required(dropzone, "dropzone").classList.remove("dragging");

  const paths = droppedFilePaths(event);
  if (paths.length === 0) {
    setGlobalStatus("Drop local image files, or use an image URL.", { tone: "error" });
    return;
  }

  await importFiles(paths);
  setGlobalStatus(`Added ${paths.length} image${paths.length === 1 ? "" : "s"}.`, { tone: "success" });
});

document.addEventListener("paste", async (event: ClipboardEvent) => {
  if (!isWorkspaceVisible() || isEditableTarget(event.target)) {
    return;
  }

  const file = clipboardImageFile(event);
  if (!file) {
    return;
  }

  event.preventDefault();
  await importClipboardImage(file);
});

required(focusSlider, "focus-slider").addEventListener("input", () => {
  applyFocusSlider(required(focusSlider, "focus-slider").value);
});

required(focusSaveBtn, "focus-save-btn").addEventListener("click", async () => {
  const item = currentItem();
  if (!item?.output_path) {
    return;
  }

  const button = required(focusSaveBtn, "focus-save-btn");
  button.disabled = true;
  setGlobalStatus("Saving image...", { toast: false });
  try {
    const result = await window.rmbg.saveProcessedImage({
      sourcePath: item.output_path,
      inputPath: item.source_path,
    });
    if (result?.canceled) {
      setGlobalStatus("Save canceled", { toast: false });
      return;
    }
    if (!result?.ok || !result.output_path) {
      throw new Error(result?.error || "Save failed");
    }
    setGlobalStatus(`Saved: ${result.output_path}`, { tone: "success" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Save failed";
    setGlobalStatus(message, { tone: "error" });
  } finally {
    button.disabled = false;
  }
});

required(focusOpenBtn, "focus-open-btn").addEventListener("click", async () => {
  const item = currentItem();
  if (!item?.output_path) {
    return;
  }
  await window.rmbg.openInFolder({ filePath: item.output_path });
});

required(focusDeleteBtn, "focus-delete-btn").addEventListener("click", async () => {
  await deleteActiveItem();
});

updateEmptyState();
renderFocusPanel();
void refreshLicenseStatus();
