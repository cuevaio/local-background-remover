import json
import os
import platform
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict

from .tls import build_ssl_context

DEFAULT_METADATA_URL = "https://local.backgroundrm.com/api/releases/latest"
DEFAULT_INSTALL_URL = "https://local.backgroundrm.com/install"
MANAGED_EXECUTABLE = Path.home() / ".local" / "bin" / "rmbg"
NETWORK_TIMEOUT_SECONDS = 20


def normalize_version(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip()
    if not normalized:
        return None

    if normalized.startswith("v"):
        return normalized[1:]

    return normalized


def _ensure_macos() -> None:
    if platform.system() != "Darwin":
        raise RuntimeError("Upgrade is currently supported on macOS only.")


def _get_text(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json, text/plain;q=0.9, */*;q=0.1",
            "User-Agent": "rmbg-cli",
        },
        method="GET",
    )
    ssl_context = build_ssl_context()

    try:
        with urllib.request.urlopen(
            request, timeout=NETWORK_TIMEOUT_SECONDS, context=ssl_context
        ) as response:
            return response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Request failed with HTTP {exc.code}: {url}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Failed to reach {url}: {exc.reason}") from exc


def fetch_latest_release(metadata_url: str) -> Dict[str, str]:
    raw = _get_text(metadata_url)

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Latest release endpoint returned invalid JSON.") from exc

    if not payload.get("ok"):
        raise RuntimeError(payload.get("error") or "Failed to resolve latest release.")

    tag = payload.get("tag")
    normalized_tag = normalize_version(tag)
    if not normalized_tag:
        raise RuntimeError("Latest release endpoint did not return a valid tag.")

    return {
        "tag": f"v{normalized_tag}",
        "source": str(payload.get("source") or "unknown"),
    }


def fetch_install_script(install_url: str) -> str:
    script = _get_text(install_url)
    if not script.strip():
        raise RuntimeError("Install script response was empty.")
    return script


def _run_installer(script: str, tag: str) -> None:
    env = os.environ.copy()
    env["RMBG_VERSION"] = tag
    result = subprocess.run(
        ["/bin/bash"],
        input=script,
        text=True,
        capture_output=True,
        env=env,
        check=False,
    )
    if result.returncode == 0:
        return

    message = result.stderr.strip() or result.stdout.strip() or "Installer failed."
    raise RuntimeError(message)


def _probe_version(executable: Path) -> str:
    result = subprocess.run(
        [str(executable), "--version"],
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        message = (
            result.stderr.strip() or result.stdout.strip() or "Version check failed."
        )
        raise RuntimeError(message)

    reported = normalize_version(result.stdout.replace("rmbg", "", 1))
    if not reported:
        raise RuntimeError("Installed binary returned an unreadable version string.")

    return reported


def _resolve_current_executable(value: str) -> str:
    candidate = value or sys.argv[0] or "rmbg"
    return str(Path(candidate).expanduser().resolve())


def run_upgrade(
    *,
    current_version: str,
    current_executable: str,
    metadata_url: str = DEFAULT_METADATA_URL,
    install_url: str = DEFAULT_INSTALL_URL,
    force: bool = False,
) -> Dict[str, Any]:
    _ensure_macos()

    latest = fetch_latest_release(metadata_url)
    normalized_current = normalize_version(current_version)
    normalized_latest = normalize_version(latest["tag"])

    if normalized_current is None:
        raise RuntimeError("Current CLI version is unavailable.")
    if normalized_latest is None:
        raise RuntimeError("Latest CLI version is unavailable.")

    resolved_executable = _resolve_current_executable(current_executable)
    managed_executable = str(MANAGED_EXECUTABLE)

    if normalized_current == normalized_latest and not force:
        return {
            "ok": True,
            "upgraded": False,
            "current_version": current_version,
            "latest_version": latest["tag"],
            "current_executable": resolved_executable,
            "managed_executable": managed_executable,
            "source": latest["source"],
            "message": f"rmbg {current_version} is already up to date.",
        }

    script = fetch_install_script(install_url)
    _run_installer(script, latest["tag"])

    managed_version = _probe_version(MANAGED_EXECUTABLE)
    if managed_version != normalized_latest:
        raise RuntimeError(
            "Installed managed binary version did not match the requested release."
        )

    return {
        "ok": True,
        "upgraded": True,
        "current_version": current_version,
        "latest_version": latest["tag"],
        "current_executable": resolved_executable,
        "managed_executable": managed_executable,
        "source": latest["source"],
        "message": (
            f"Upgraded rmbg to {latest['tag']} and installed managed binary at "
            f"{managed_executable}."
        ),
    }
