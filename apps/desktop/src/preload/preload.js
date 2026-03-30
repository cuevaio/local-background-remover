const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("rmbg", {
  pickImages: () => ipcRenderer.invoke("pick-images"),
  modelStatus: () => ipcRenderer.invoke("model-status"),
  workerStatus: () => ipcRenderer.invoke("worker-status"),
  ensureModel: () => ipcRenderer.invoke("ensure-model"),
  removeBackground: (payload) => ipcRenderer.invoke("remove-background", payload),
  licenseStatus: () => ipcRenderer.invoke("license-status"),
  licenseActivate: (payload) => ipcRenderer.invoke("license-activate", payload),
  licenseRefresh: () => ipcRenderer.invoke("license-refresh"),
});
