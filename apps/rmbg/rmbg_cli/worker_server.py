import gc
import json
import select
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional

from transformers import AutoModelForImageSegmentation

from .config import DEFAULT_WORKER_IDLE_SECONDS, resolve_model_dir
from .inference import get_runtime, load_model, remove_background
from .io import load_image, save_png
from .model_manager import ensure_local_model


@dataclass
class WorkerState:
    model: Optional[AutoModelForImageSegmentation] = None
    device: Optional[Any] = None
    dtype: Optional[Any] = None
    model_dir: Optional[Path] = None
    shutdown_requested: bool = False
    model_dir_override: Optional[str] = None


def _resolve_model_dir(state: WorkerState, payload: Dict[str, Any]) -> Path:
    model_dir = payload.get("model_dir") or state.model_dir_override
    return resolve_model_dir(model_dir)


def _release_model(state: WorkerState) -> None:
    if state.model is None:
        return

    state.model = None
    state.device = None
    state.dtype = None
    state.model_dir = None
    gc.collect()

    try:
        import torch

        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        mps = getattr(torch, "mps", None)
        if mps is not None and hasattr(mps, "empty_cache"):
            mps.empty_cache()
    except Exception:
        pass


def _ensure_model_loaded(state: WorkerState, model_dir: Path) -> None:
    if state.model is not None and state.model_dir == model_dir:
        return

    _release_model(state)
    model, device, dtype = load_model(model_dir)
    state.model = model
    state.device = device
    state.dtype = dtype
    state.model_dir = model_dir


def _handle_request(state: WorkerState, request: Dict[str, Any]) -> Dict[str, Any]:
    action = request.get("action")
    payload = request.get("payload") or {}

    if action == "ping":
        runtime_device, runtime_dtype = get_runtime()
        return {
            "ready": True,
            "model_loaded": state.model is not None,
            "model_dir": str(state.model_dir) if state.model_dir else None,
            "runtime_device": runtime_device.type,
            "runtime_dtype": str(runtime_dtype),
        }

    if action == "shutdown":
        state.shutdown_requested = True
        return {"shutdown": True}

    if action == "ensure_model":
        model_dir = _resolve_model_dir(state, payload)
        bootstrapped = ensure_local_model(model_dir, allow_download=True)
        return {
            "ok": True,
            "bootstrapped": bootstrapped,
            "model_dir": str(model_dir),
            "model_loaded": state.model is not None,
        }

    if action == "remove":
        input_path = payload.get("input_path")
        output_path = payload.get("output_path")
        if not input_path:
            raise RuntimeError("input_path is required")
        if not output_path:
            raise RuntimeError("output_path is required")

        model_dir = _resolve_model_dir(state, payload)
        bootstrapped = ensure_local_model(model_dir, allow_download=True)
        _ensure_model_loaded(state, model_dir)

        image = load_image(str(input_path))
        processed = remove_background(image, state.model, state.device, state.dtype)
        saved_path = save_png(processed, str(output_path))

        return {
            "ok": True,
            "output_path": saved_path,
            "bootstrapped": bootstrapped,
            "model_dir": str(model_dir),
            "model_loaded": True,
            "runtime_device": state.device.type if state.device is not None else None,
            "runtime_dtype": str(state.dtype) if state.dtype is not None else None,
            "message": "Background removed successfully.",
        }

    raise RuntimeError(f"Unsupported worker action '{action}'")


def _emit(response: Dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(response) + "\n")
    sys.stdout.flush()


def run_worker_server(idle_seconds: int, model_dir_override: Optional[str]) -> int:
    idle_seconds = max(5, idle_seconds)
    state = WorkerState(model_dir_override=model_dir_override)

    deadline = time.monotonic() + idle_seconds

    while True:
        timeout = max(0.0, deadline - time.monotonic())
        readable, _, _ = select.select([sys.stdin], [], [], timeout)
        if not readable:
            break

        line = sys.stdin.readline()
        if line == "":
            break

        line = line.strip()
        if not line:
            deadline = time.monotonic() + idle_seconds
            continue

        request_id = None
        try:
            request = json.loads(line)
            request_id = request.get("id")
            result = _handle_request(state, request)
            _emit({"id": request_id, "ok": True, "result": result})
        except Exception as exc:
            _emit({"id": request_id, "ok": False, "error": str(exc)})

        if state.shutdown_requested:
            break

        deadline = time.monotonic() + idle_seconds

    _release_model(state)
    return 0


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="rmbg worker server")
    parser.add_argument("--idle-seconds", type=int, default=DEFAULT_WORKER_IDLE_SECONDS)
    parser.add_argument("--model-dir", type=str, default=None)
    args = parser.parse_args()
    raise SystemExit(run_worker_server(args.idle_seconds, args.model_dir))


if __name__ == "__main__":
    main()
