type LicenseSurface = "desktop" | "cli";

type LibraryImageItem = {
  id: string;
  original_name: string;
  source_path: string;
  output_path: string | null;
  created_at: number;
  processed_at: number | null;
};

type StorageRecord = {
  name: string;
  originalPath: string;
  processedPath: string | null;
};

type RemoveBackgroundResponse = {
  ok?: boolean;
  error?: string;
  output_path?: string;
};

type SaveProcessedResponse = {
  ok?: boolean;
  canceled?: boolean;
  error?: string;
  output_path?: string;
};

type OpenInFolderResponse = {
  ok?: boolean;
  error?: string;
};

type LicenseResponse = {
  ok?: boolean;
  licensed?: boolean;
  phase?: string;
};

type LicenseStatusResponse = {
  desktop?: LicenseResponse;
  cli?: LicenseResponse;
  ready?: boolean;
};

type WorkerStatusResponse = {
  running?: boolean;
  model_loaded?: boolean;
  runtime_device?: string;
};

interface Window {
  rmbg: {
    scanStorage: () => Promise<StorageRecord[]>;
    copyToStorage: (payload: { sourcePath: string }) => Promise<{ ok: boolean; path: string; name: string }>;
    getStorageDir: () => Promise<string>;
    pickImages: () => Promise<string[]>;
    resolveDroppedFilePaths: (files: File[]) => string[];
    libraryList: () => Promise<{ ok?: boolean; folder_path?: string; items?: LibraryImageItem[] }>;
    libraryImportFiles: (payload: { paths: string[] }) => Promise<{ ok?: boolean; items?: LibraryImageItem[]; imported?: LibraryImageItem[] }>;
    libraryImportUrl: (payload: { url: string }) => Promise<{ ok?: boolean; items?: LibraryImageItem[]; imported?: LibraryImageItem }>;
    libraryImportClipboardImage: (payload: { bytes: Uint8Array; contentType: string; originalName?: string }) => Promise<{ ok?: boolean; items?: LibraryImageItem[]; imported?: LibraryImageItem }>;
    libraryProcess: (payload: { id: string }) => Promise<{ ok?: boolean; item?: LibraryImageItem; items?: LibraryImageItem[]; error?: string }>;
    libraryDelete: (payload: { id: string }) => Promise<{ ok?: boolean; deleted_id?: string; items?: LibraryImageItem[]; error?: string }>;
    openLibraryFolder: () => Promise<{ ok?: boolean; folder_path?: string }>;
    ensureRuntime: () => Promise<{ ok?: boolean; runtime_path?: string | null }>;
    openRuntimeInstallUrl: () => Promise<{ ok?: boolean; url?: string }>;
    modelStatus: () => Promise<{ ready?: boolean }>;
    workerStatus: () => Promise<WorkerStatusResponse>;
    ensureModel: () => Promise<{ ok?: boolean; error?: string; bootstrapped?: boolean }>;
    removeBackground: (payload: { inputPath: string; outputPath?: string }) => Promise<RemoveBackgroundResponse>;
    saveProcessedImage: (payload: { sourcePath: string; inputPath: string }) => Promise<SaveProcessedResponse>;
    openInFolder: (payload: { filePath: string }) => Promise<OpenInFolderResponse>;
    licenseStatus: () => Promise<LicenseStatusResponse>;
    licenseActivate: (payload: { key: string; surface: LicenseSurface }) => Promise<{ ok?: boolean; error?: string }>;
    licenseRefresh: (payload: { surface: LicenseSurface }) => Promise<{ ok?: boolean; error?: string }>;
  };
}
