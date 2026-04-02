const { contextBridge, ipcRenderer } = require("electron");

type PreloadLicenseSurface = "desktop" | "cli";

type RemoveBackgroundPayload = {
  inputPath: string;
  outputPath?: string;
};

type SaveProcessedPayload = {
  sourcePath: string;
  inputPath: string;
};

type OpenInFolderPayload = {
  filePath: string;
};

type LibraryImportFilesPayload = {
  paths: string[];
};

type LibraryImportUrlPayload = {
  url: string;
};

type LibraryProcessPayload = {
  id: string;
};

type LibraryDeletePayload = {
  id: string;
};

type LicensePayload = {
  key: string;
  surface: PreloadLicenseSurface;
};

type RefreshPayload = {
  surface: PreloadLicenseSurface;
};

contextBridge.exposeInMainWorld("rmbg", {
  scanStorage: () => ipcRenderer.invoke("scan-storage"),
  copyToStorage: (payload: { sourcePath: string }) => ipcRenderer.invoke("copy-to-storage", payload),
  getStorageDir: () => ipcRenderer.invoke("get-storage-dir"),
  pickImages: () => ipcRenderer.invoke("pick-images"),
  libraryList: () => ipcRenderer.invoke("library-list"),
  libraryImportFiles: (payload: LibraryImportFilesPayload) =>
    ipcRenderer.invoke("library-import-files", payload),
  libraryImportUrl: (payload: LibraryImportUrlPayload) =>
    ipcRenderer.invoke("library-import-url", payload),
  libraryProcess: (payload: LibraryProcessPayload) => ipcRenderer.invoke("library-process", payload),
  libraryDelete: (payload: LibraryDeletePayload) => ipcRenderer.invoke("library-delete", payload),
  openLibraryFolder: () => ipcRenderer.invoke("open-library-folder"),
  ensureRuntime: () => ipcRenderer.invoke("ensure-runtime"),
  openRuntimeInstallUrl: () => ipcRenderer.invoke("open-runtime-install-url"),
  modelStatus: () => ipcRenderer.invoke("model-status"),
  workerStatus: () => ipcRenderer.invoke("worker-status"),
  ensureModel: () => ipcRenderer.invoke("ensure-model"),
  removeBackground: (payload: RemoveBackgroundPayload) =>
    ipcRenderer.invoke("remove-background", payload),
  saveProcessedImage: (payload: SaveProcessedPayload) =>
    ipcRenderer.invoke("save-processed-image", payload),
  openInFolder: (payload: OpenInFolderPayload) => ipcRenderer.invoke("open-in-folder", payload),
  licenseStatus: () => ipcRenderer.invoke("license-status"),
  licenseActivate: (payload: LicensePayload) => ipcRenderer.invoke("license-activate", payload),
  licenseRefresh: (payload: RefreshPayload) => ipcRenderer.invoke("license-refresh", payload),
});
