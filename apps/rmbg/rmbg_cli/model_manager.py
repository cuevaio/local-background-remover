import json
import os
from pathlib import Path
from typing import Callable, Optional

from huggingface_hub import snapshot_download
from huggingface_hub.utils import disable_progress_bars
from huggingface_hub.utils.logging import set_verbosity_error

from .config import MODEL_REPO_ID

ProgressCallback = Optional[Callable[[str, str], None]]


def _emit(progress: ProgressCallback, stage: str, message: str) -> None:
    if progress:
        progress(stage, message)


def _snapshot_token() -> str | bool:
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_HUB_TOKEN")
    if token:
        return token
    return False


def validate_local_model_dir(model_dir: Path) -> None:
    if not model_dir.exists() or not model_dir.is_dir():
        raise FileNotFoundError(
            f"Model directory not found: {model_dir}. "
            "Set BIREFNET_MODEL_DIR to a valid local path."
        )

    config_path = model_dir / "config.json"
    if not config_path.exists():
        raise FileNotFoundError(f"Missing required model file: {config_path}")

    has_weights = any(
        (model_dir / filename).exists()
        for filename in ("model.safetensors", "pytorch_model.bin")
    )
    if not has_weights:
        raise FileNotFoundError(
            f"Missing weights in {model_dir}. "
            "Expected 'model.safetensors' or 'pytorch_model.bin'."
        )

    try:
        config_data = json.loads(config_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in model config file: {config_path}") from exc

    auto_map = config_data.get("auto_map", {})
    for value in auto_map.values():
        entries = value if isinstance(value, list) else [value]
        for entry in entries:
            if not isinstance(entry, str) or "." not in entry:
                continue
            module_name = entry.split(".", 1)[0]
            module_path = model_dir / f"{module_name}.py"
            if module_name and not module_path.exists():
                raise FileNotFoundError(
                    "Missing custom model code required by config auto_map: "
                    f"{module_path}"
                )


def ensure_local_model(
    model_dir: Path,
    progress: ProgressCallback = None,
    allow_download: bool = True,
) -> bool:
    """Ensure model files exist locally.

    Returns True if bootstrap download happened in this call.
    """
    try:
        validate_local_model_dir(model_dir)
        _emit(progress, "ready", f"Using cached model in {model_dir}")
        return False
    except (FileNotFoundError, ValueError) as validation_error:
        if not allow_download:
            raise RuntimeError(
                f"Model files are missing or incomplete at {model_dir}."
            ) from validation_error

        if (
            os.environ.get("HF_HUB_OFFLINE") == "1"
            or os.environ.get("TRANSFORMERS_OFFLINE") == "1"
        ):
            raise RuntimeError(
                "Local model files are missing or incomplete and offline mode is "
                "enabled. Run once online to bootstrap model files."
            ) from validation_error

    _emit(progress, "prepare", f"Creating model directory at {model_dir}")
    model_dir.mkdir(parents=True, exist_ok=True)

    _emit(progress, "download", f"Downloading {MODEL_REPO_ID}")
    os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
    disable_progress_bars()
    set_verbosity_error()
    try:
        snapshot_download(
            repo_id=MODEL_REPO_ID,
            local_dir=str(model_dir),
            token=_snapshot_token(),
        )
    except Exception as exc:
        raise RuntimeError(
            f"Failed to download model '{MODEL_REPO_ID}' to {model_dir}."
        ) from exc

    _emit(progress, "validate", "Validating downloaded model files")
    try:
        validate_local_model_dir(model_dir)
    except (FileNotFoundError, ValueError) as exc:
        raise RuntimeError(
            f"Downloaded model files to {model_dir}, but required artifacts are missing."
        ) from exc

    _emit(progress, "ready", f"Model bootstrapped at {model_dir}")
    return True
