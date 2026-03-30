type LicenseSurface = "desktop" | "cli";

type RemoveBackgroundResponse = {
  ok?: boolean;
  error?: string;
  output_path?: string;
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
    pickImages: () => Promise<string[]>;
    modelStatus: () => Promise<{ ready?: boolean }>;
    workerStatus: () => Promise<WorkerStatusResponse>;
    ensureModel: () => Promise<{ ok?: boolean; error?: string; bootstrapped?: boolean }>;
    removeBackground: (payload: { inputPath: string; outputPath?: string }) => Promise<RemoveBackgroundResponse>;
    licenseStatus: () => Promise<LicenseStatusResponse>;
    licenseActivate: (payload: { key: string; surface: LicenseSurface }) => Promise<{ ok?: boolean; error?: string }>;
    licenseRefresh: (payload: { surface: LicenseSurface }) => Promise<{ ok?: boolean; error?: string }>;
  };
}
