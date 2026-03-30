const { contextBridge, ipcRenderer } = require("electron");

type PreloadLicenseSurface = "desktop" | "cli";

type RemoveBackgroundPayload = {
  inputPath: string;
  outputPath?: string;
};

type LicensePayload = {
  key: string;
  surface: PreloadLicenseSurface;
};

type RefreshPayload = {
  surface: PreloadLicenseSurface;
};

contextBridge.exposeInMainWorld("rmbg", {
  pickImages: () => ipcRenderer.invoke("pick-images"),
  modelStatus: () => ipcRenderer.invoke("model-status"),
  workerStatus: () => ipcRenderer.invoke("worker-status"),
  ensureModel: () => ipcRenderer.invoke("ensure-model"),
  removeBackground: (payload: RemoveBackgroundPayload) =>
    ipcRenderer.invoke("remove-background", payload),
  licenseStatus: () => ipcRenderer.invoke("license-status"),
  licenseActivate: (payload: LicensePayload) => ipcRenderer.invoke("license-activate", payload),
  licenseRefresh: (payload: RefreshPayload) => ipcRenderer.invoke("license-refresh", payload),
});
