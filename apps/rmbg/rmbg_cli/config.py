import os
from pathlib import Path
from typing import Optional

MODEL_REPO_ID = "ZhengPeng7/BiRefNet"
DEFAULT_MODEL_DIR = (
    Path.home() / ".cache" / "background-removal" / "models" / "birefnet"
)
DEFAULT_LICENSE_CACHE_PATH = (
    Path.home() / ".cache" / "background-removal" / "license" / "license.json"
)
DEFAULT_LICENSE_DEVICE_ID_PATH = (
    Path.home() / ".cache" / "background-removal" / "license" / "device-id"
)
DEFAULT_LICENSE_API_BASE_URL = "https://localremovebg.com"
DEFAULT_WORKER_IDLE_SECONDS = int(os.environ.get("RMBG_WORKER_IDLE_SECONDS", "300"))
LICENSE_GRACE_SECONDS = 3 * 24 * 60 * 60
LICENSE_REFRESH_THRESHOLD_SECONDS = 7 * 24 * 60 * 60


def resolve_model_dir(model_dir: Optional[str]) -> Path:
    if model_dir:
        return Path(model_dir).expanduser().resolve()
    return (
        Path(os.environ.get("BIREFNET_MODEL_DIR", str(DEFAULT_MODEL_DIR)))
        .expanduser()
        .resolve()
    )


def set_runtime_offline_env() -> None:
    os.environ["HF_HUB_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"
    os.environ["HF_DATASETS_OFFLINE"] = "1"
    os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
