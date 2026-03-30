export const CLI_INSTALL_CMD = "curl -fsSL https://local.backgroundrm.com/install | bash";
export const CLI_VERSION_CMD = "rmbg --version";
export const CLI_HELP_CMD = "rmbg --help";

export const CLI_ACTIVATE_CMD =
  "rmbg license activate --key YOUR_KEY --surface cli --format json";
export const CLI_STATUS_CMD = "rmbg license status --surface cli --format json";

export const CLI_MODEL_ENSURE_CMD = "rmbg model ensure --surface cli --format json";

export const CLI_REMOVE_CMD =
  "rmbg remove --surface cli --input ./input.jpg --output ./input_rmbg.png --format json";

export const CLI_REMOVE_WITH_DESKTOP_REQUIREMENT_CMD =
  "rmbg remove --surface cli --require-surface desktop --input ./input.jpg --output ./input_rmbg.png --format json";

type CliCommandReference = {
  command: string;
  purpose: string;
  notes: string;
};

export const CLI_COMMAND_REFERENCE: CliCommandReference[] = [
  {
    command: CLI_INSTALL_CMD,
    purpose: "Download and install the latest macOS CLI build",
    notes: "Creates an rmbg symlink in ~/.local/bin by default.",
  },
  {
    command: CLI_ACTIVATE_CMD,
    purpose: "Activate your CLI entitlement on this machine",
    notes: "Required before running model ensure or remove.",
  },
  {
    command: CLI_STATUS_CMD,
    purpose: "Read local activation state for the CLI surface",
    notes: "Useful for health checks in scripts and CI.",
  },
  {
    command: CLI_MODEL_ENSURE_CMD,
    purpose: "Bootstrap the local model if files are missing",
    notes: "Defaults to ~/.cache/background-removal/models/birefnet.",
  },
  {
    command: CLI_REMOVE_CMD,
    purpose: "Remove a background from one image",
    notes: "Input accepts local paths and http/https image URLs.",
  },
  {
    command: CLI_HELP_CMD,
    purpose: "Show top-level command help",
    notes: "Use rmbg <command> --help for command-specific docs.",
  },
];

type CliExitCode = {
  code: number;
  reason: string;
};

export const CLI_EXIT_CODES: CliExitCode[] = [
  { code: 0, reason: "Success" },
  { code: 2, reason: "Input image read or validation failure" },
  { code: 3, reason: "Model bootstrap or model availability failure" },
  { code: 4, reason: "Inference failure" },
  { code: 5, reason: "Output image write failure" },
  { code: 6, reason: "License activation or validation failure" },
];
