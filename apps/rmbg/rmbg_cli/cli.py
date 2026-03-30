import argparse
import json
import sys
import time
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import Any, Dict

from .config import DEFAULT_WORKER_IDLE_SECONDS, resolve_model_dir
from .io import default_output_path, load_image, save_png
from .license_manager import (
    activate_license,
    ensure_required_surfaces,
    refresh_license,
    resolve_license_file,
    should_refresh,
    status,
)
from .model_manager import ensure_local_model, validate_local_model_dir


try:
    RMBG_VERSION = version("rmbg")
except PackageNotFoundError:
    RMBG_VERSION = "0.3.1"


def _print(data: Dict[str, Any], as_json: bool) -> None:
    if as_json:
        print(json.dumps(data))
    else:
        if data.get("ok"):
            print(data.get("message", "ok"))
        else:
            print(data.get("error", "error"), file=sys.stderr)


def _wants_json(args: argparse.Namespace) -> bool:
    return bool(getattr(args, "json", False) or getattr(args, "format", "") == "json")


def _emit_progress(mode: str, stage: str, message: str) -> None:
    if mode != "jsonl":
        return
    print(json.dumps({"stage": stage, "message": message}), file=sys.stderr, flush=True)


def _collect_required_surfaces(args: argparse.Namespace) -> list[str]:
    required = [args.surface]
    extra = getattr(args, "require_surface", None) or []
    required.extend(extra)
    return required


def cmd_model_status(args: argparse.Namespace) -> int:
    model_dir = resolve_model_dir(args.model_dir)
    try:
        validate_local_model_dir(model_dir)
        _print(
            {
                "ok": True,
                "ready": True,
                "model_dir": str(model_dir),
                "message": "Model is available locally.",
            },
            _wants_json(args),
        )
        return 0
    except Exception as exc:
        _print(
            {
                "ok": True,
                "ready": False,
                "model_dir": str(model_dir),
                "message": str(exc),
            },
            _wants_json(args),
        )
        return 0


def cmd_model_ensure(args: argparse.Namespace) -> int:
    model_dir = resolve_model_dir(args.model_dir)
    try:
        license_path = resolve_license_file(args.license_file)
        ensure_required_surfaces(license_path, _collect_required_surfaces(args))
        if should_refresh(license_path, args.surface):
            try:
                refresh_license(license_path, args.surface, args.api_base)
            except Exception:
                pass
    except Exception as exc:
        _print(
            {
                "ok": False,
                "error": f"License check failed: {exc}",
            },
            _wants_json(args),
        )
        return 6

    try:
        bootstrapped = ensure_local_model(
            model_dir,
            progress=lambda stage, message: _emit_progress(
                args.progress, stage, message
            ),
            allow_download=True,
        )
    except Exception as exc:
        _print(
            {
                "ok": False,
                "error": str(exc),
                "model_dir": str(model_dir),
            },
            _wants_json(args),
        )
        return 3

    _print(
        {
            "ok": True,
            "bootstrapped": bootstrapped,
            "model_dir": str(model_dir),
            "message": "Model ready.",
        },
        _wants_json(args),
    )
    return 0


def cmd_remove(args: argparse.Namespace) -> int:
    started = time.time()
    model_dir = resolve_model_dir(args.model_dir)
    output_path = args.output or default_output_path(args.input)

    try:
        license_path = resolve_license_file(args.license_file)
        ensure_required_surfaces(license_path, _collect_required_surfaces(args))
        if should_refresh(license_path, args.surface):
            try:
                refresh_license(license_path, args.surface, args.api_base)
            except Exception:
                pass
    except Exception as exc:
        _print(
            {
                "ok": False,
                "error": f"License check failed: {exc}",
            },
            _wants_json(args),
        )
        return 6

    try:
        bootstrapped = ensure_local_model(
            model_dir,
            progress=lambda stage, message: _emit_progress(
                args.progress, stage, message
            ),
            allow_download=True,
        )
    except Exception as exc:
        _print(
            {
                "ok": False,
                "error": str(exc),
                "model_dir": str(model_dir),
            },
            _wants_json(args),
        )
        return 3

    try:
        image = load_image(args.input)
    except Exception as exc:
        _print(
            {"ok": False, "error": f"Failed to read input image: {exc}"},
            _wants_json(args),
        )
        return 2

    _emit_progress(args.progress, "inference", "Running background removal")
    try:
        from .inference import load_model, remove_background

        model, device, dtype = load_model(model_dir)
        processed = remove_background(image, model, device, dtype)
    except Exception as exc:
        _print({"ok": False, "error": f"Inference failed: {exc}"}, _wants_json(args))
        return 4

    try:
        saved = save_png(processed, output_path)
    except Exception as exc:
        _print(
            {"ok": False, "error": f"Failed to write output image: {exc}"},
            _wants_json(args),
        )
        return 5

    duration_ms = int((time.time() - started) * 1000)
    _print(
        {
            "ok": True,
            "input_path": str(Path(args.input).resolve()),
            "output_path": saved,
            "model_dir": str(model_dir),
            "bootstrapped": bootstrapped,
            "duration_ms": duration_ms,
            "message": "Background removed successfully.",
        },
        _wants_json(args),
    )
    return 0


def cmd_license_activate(args: argparse.Namespace) -> int:
    license_path = resolve_license_file(args.license_file)
    try:
        response = activate_license(license_path, args.key, args.surface, args.api_base)
    except Exception as exc:
        _print({"ok": False, "error": str(exc)}, _wants_json(args))
        return 6

    _print(
        {
            "ok": True,
            "license_file": str(license_path),
            "surface": args.surface,
            "activation_id": response.get("activation_id"),
            "expires_at": response.get("expires_at"),
            "grace_expires_at": response.get("grace_expires_at"),
            "message": "License activated successfully.",
        },
        _wants_json(args),
    )
    return 0


def cmd_license_status(args: argparse.Namespace) -> int:
    license_path = resolve_license_file(args.license_file)
    try:
        current = status(license_path, args.surface)
    except Exception as exc:
        _print({"ok": False, "error": str(exc)}, _wants_json(args))
        return 6

    _print(
        {
            **current,
            "license_file": str(license_path),
        },
        _wants_json(args),
    )
    return 0


def cmd_license_refresh(args: argparse.Namespace) -> int:
    license_path = resolve_license_file(args.license_file)
    try:
        response = refresh_license(license_path, args.surface, args.api_base)
    except Exception as exc:
        _print({"ok": False, "error": str(exc)}, _wants_json(args))
        return 6

    _print(
        {
            "ok": True,
            "license_file": str(license_path),
            "surface": args.surface,
            "activation_id": response.get("activation_id"),
            "expires_at": response.get("expires_at"),
            "grace_expires_at": response.get("grace_expires_at"),
            "message": "License refreshed successfully.",
        },
        _wants_json(args),
    )
    return 0


def cmd_worker(args: argparse.Namespace) -> int:
    from .worker_server import run_worker_server

    return run_worker_server(args.idle_seconds, args.model_dir)


def _add_output_flags(cmd: argparse.ArgumentParser) -> None:
    cmd.add_argument("--json", action="store_true", help="Output JSON")
    cmd.add_argument(
        "--format",
        type=str,
        choices=["text", "json"],
        default="text",
        help="Output format",
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="rmbg",
        description="Background removal CLI",
        epilog=(
            "Examples:\n"
            "  rmbg license activate --key YOUR_KEY --surface cli --json\n"
            "  rmbg model ensure --surface cli --format json\n"
            "  rmbg remove --input image.jpg --output image_rmbg.png --format json"
        ),
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument("--version", action="version", version=f"rmbg {RMBG_VERSION}")
    subparsers = parser.add_subparsers(dest="command", required=True)

    model_parser = subparsers.add_parser("model", help="Model bootstrap and status")
    model_sub = model_parser.add_subparsers(dest="model_command", required=True)

    model_status = model_sub.add_parser("status", help="Check local model availability")
    model_status.add_argument("--model-dir", type=str, default=None)
    _add_output_flags(model_status)
    model_status.set_defaults(func=cmd_model_status)

    model_ensure = model_sub.add_parser("ensure", help="Download model if missing")
    model_ensure.add_argument("--model-dir", type=str, default=None)
    model_ensure.add_argument(
        "--surface",
        type=str,
        choices=["cli", "desktop", "app"],
        default="cli",
        help="License surface to validate before bootstrap",
    )
    model_ensure.add_argument(
        "--require-surface",
        type=str,
        choices=["cli", "desktop", "app"],
        action="append",
        default=[],
        help="Additional surface requirement(s), repeatable",
    )
    model_ensure.add_argument("--license-file", type=str, default=None)
    model_ensure.add_argument("--api-base", type=str, default=None)
    model_ensure.add_argument(
        "--license-api",
        dest="api_base",
        type=str,
        default=None,
        help="Deprecated alias for --api-base",
    )
    _add_output_flags(model_ensure)
    model_ensure.add_argument(
        "--progress",
        type=str,
        choices=["jsonl", "none"],
        default="jsonl",
        help="Progress output mode",
    )
    model_ensure.set_defaults(func=cmd_model_ensure)

    remove_parser = subparsers.add_parser("remove", help="Remove image background")
    remove_parser.add_argument("--input", type=str, required=True)
    remove_parser.add_argument("--output", type=str, default=None)
    remove_parser.add_argument("--model-dir", type=str, default=None)
    remove_parser.add_argument(
        "--surface",
        type=str,
        choices=["cli", "desktop", "app"],
        default="cli",
        help="License surface to validate before processing",
    )
    remove_parser.add_argument(
        "--require-surface",
        type=str,
        choices=["cli", "desktop", "app"],
        action="append",
        default=[],
        help="Additional surface requirement(s), repeatable",
    )
    remove_parser.add_argument("--license-file", type=str, default=None)
    remove_parser.add_argument("--api-base", type=str, default=None)
    remove_parser.add_argument(
        "--license-api",
        dest="api_base",
        type=str,
        default=None,
        help="Deprecated alias for --api-base",
    )
    _add_output_flags(remove_parser)
    remove_parser.add_argument(
        "--progress",
        type=str,
        choices=["jsonl", "none"],
        default="jsonl",
        help="Progress output mode",
    )
    remove_parser.set_defaults(func=cmd_remove)

    worker_parser = subparsers.add_parser(
        "worker",
        help="Internal persistent worker",
    )
    worker_parser.add_argument(
        "--idle-seconds",
        type=int,
        default=DEFAULT_WORKER_IDLE_SECONDS,
        help="Auto-exit after this many idle seconds",
    )
    worker_parser.add_argument("--model-dir", type=str, default=None)
    worker_parser.set_defaults(func=cmd_worker)

    license_parser = subparsers.add_parser(
        "license", help="License activation and status"
    )
    license_sub = license_parser.add_subparsers(dest="license_command", required=True)

    license_activate = license_sub.add_parser("activate", help="Activate a license key")
    license_activate.add_argument("--key", type=str, required=True)
    license_activate.add_argument(
        "--surface",
        type=str,
        choices=["cli", "desktop", "app"],
        default="cli",
    )
    license_activate.add_argument("--license-file", type=str, default=None)
    license_activate.add_argument("--api-base", type=str, default=None)
    _add_output_flags(license_activate)
    license_activate.set_defaults(func=cmd_license_activate)

    license_status = license_sub.add_parser("status", help="Show local license status")
    license_status.add_argument(
        "--surface",
        type=str,
        choices=["cli", "desktop", "app"],
        default="cli",
    )
    license_status.add_argument("--license-file", type=str, default=None)
    _add_output_flags(license_status)
    license_status.set_defaults(func=cmd_license_status)

    license_refresh = license_sub.add_parser(
        "refresh", help="Refresh local license token"
    )
    license_refresh.add_argument(
        "--surface",
        type=str,
        choices=["cli", "desktop", "app"],
        default="cli",
    )
    license_refresh.add_argument("--license-file", type=str, default=None)
    license_refresh.add_argument("--api-base", type=str, default=None)
    _add_output_flags(license_refresh)
    license_refresh.set_defaults(func=cmd_license_refresh)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    code = args.func(args)
    raise SystemExit(code)


if __name__ == "__main__":
    main()
