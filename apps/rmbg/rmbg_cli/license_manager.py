import base64
import hashlib
import json
import os
import platform
import ssl
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey

from .config import (
    DEFAULT_LICENSE_API_BASE_URL,
    DEFAULT_LICENSE_CACHE_PATH,
    DEFAULT_LICENSE_DEVICE_ID_PATH,
    LICENSE_GRACE_SECONDS,
    LICENSE_REFRESH_THRESHOLD_SECONDS,
)

VALID_SURFACES = {"cli", "desktop"}


def _b64url_decode(raw: str) -> bytes:
    padding = "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode(raw + padding)


def normalize_surface(surface: str) -> str:
    normalized = (surface or "").strip().lower()
    if normalized == "app":
        return "desktop"
    if normalized in VALID_SURFACES:
        return normalized
    raise RuntimeError(f"Unsupported surface '{surface}'")


def _load_public_key() -> Ed25519PublicKey:
    key = os.environ.get("RMBG_LICENSE_PUBLIC_KEY")
    if not key:
        raise RuntimeError(
            "RMBG_LICENSE_PUBLIC_KEY is required for license verification"
        )

    try:
        key_bytes = base64.b64decode(key)
    except Exception as exc:
        raise RuntimeError("RMBG_LICENSE_PUBLIC_KEY must be valid base64") from exc

    if len(key_bytes) != 32:
        raise RuntimeError("RMBG_LICENSE_PUBLIC_KEY must decode to 32 bytes")

    return Ed25519PublicKey.from_public_bytes(key_bytes)


def _license_device_id_file() -> Path:
    env_path = os.environ.get("RMBG_LICENSE_DEVICE_ID_FILE")
    if env_path:
        return Path(env_path).expanduser().resolve()
    return DEFAULT_LICENSE_DEVICE_ID_PATH


def _fallback_device_id() -> str:
    seed = {
        "home": str(Path.home()),
        "machine": platform.machine(),
        "system": platform.system(),
    }
    payload = json.dumps(seed, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _stable_device_id() -> str:
    env_device_id = os.environ.get("RMBG_LICENSE_DEVICE_ID")
    if env_device_id and env_device_id.strip():
        return env_device_id.strip()

    device_id_path = _license_device_id_file()

    try:
        if device_id_path.exists():
            existing = device_id_path.read_text(encoding="utf-8").strip()
            if existing:
                return existing
    except OSError:
        return _fallback_device_id()

    generated = str(uuid.uuid4())
    try:
        device_id_path.parent.mkdir(parents=True, exist_ok=True)
        device_id_path.write_text(generated, encoding="utf-8")
    except OSError:
        return _fallback_device_id()

    return generated


def machine_fingerprint() -> str:
    payload = json.dumps(
        {"device_id": _stable_device_id()},
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def resolve_license_file(path_override: Optional[str]) -> Path:
    if path_override:
        return Path(path_override).expanduser().resolve()

    env_path = os.environ.get("RMBG_LICENSE_FILE")
    if env_path:
        return Path(env_path).expanduser().resolve()

    return DEFAULT_LICENSE_CACHE_PATH


def _normalize_state(raw_state: Dict[str, Any]) -> Dict[str, Any]:
    if not raw_state:
        return {"version": 2, "activations": {}}

    activations = raw_state.get("activations")
    if isinstance(activations, dict):
        normalized_activations: Dict[str, Dict[str, Any]] = {}
        for key, value in activations.items():
            try:
                surface = normalize_surface(str(key))
            except RuntimeError:
                continue
            if isinstance(value, dict):
                normalized_activations[surface] = value
        return {"version": 2, "activations": normalized_activations}

    token = raw_state.get("token")
    if token:
        surface_raw = str(raw_state.get("surface") or "cli")
        try:
            surface = normalize_surface(surface_raw)
        except RuntimeError:
            surface = "cli"
        activation = {
            "token": token,
            "license_key": raw_state.get("license_key"),
            "surface": surface,
            "activated_at": raw_state.get("activated_at"),
            "refreshed_at": raw_state.get("refreshed_at"),
            "api_base": raw_state.get("api_base"),
        }
        return {"version": 2, "activations": {surface: activation}}

    return {"version": 2, "activations": {}}


def load_license_state(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {"version": 2, "activations": {}}
    try:
        raw_state = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid license cache file: {path}") from exc
    return _normalize_state(raw_state)


def save_license_state(path: Path, state: Dict[str, Any]) -> None:
    normalized = _normalize_state(state)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(normalized, indent=2), encoding="utf-8")


def parse_and_verify_token(token: str) -> Dict[str, Any]:
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
    except ValueError as exc:
        raise RuntimeError("Invalid license token format") from exc

    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = _b64url_decode(sig_b64)

    public_key = _load_public_key()
    try:
        public_key.verify(signature, signing_input)
    except InvalidSignature as exc:
        raise RuntimeError("License token signature verification failed") from exc

    payload_raw = _b64url_decode(payload_b64)
    try:
        payload = json.loads(payload_raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise RuntimeError("Invalid license token payload JSON") from exc

    return payload


def evaluate_token(payload: Dict[str, Any], surface: str) -> Dict[str, Any]:
    now = int(time.time())
    exp = int(payload.get("exp", 0))
    grace_exp = int(payload.get("grace_exp", exp + LICENSE_GRACE_SECONDS))
    token_surfaces = payload.get("surfaces") or []
    expected_machine = payload.get("machine_hash")
    machine_hash = machine_fingerprint()
    machine_ok = expected_machine == machine_hash
    surface_ok = surface in token_surfaces

    if now <= exp:
        phase = "active"
    elif now <= grace_exp:
        phase = "grace"
    else:
        phase = "expired"

    return {
        "phase": phase,
        "surface_ok": surface_ok,
        "machine_ok": machine_ok,
        "expires_at": exp,
        "grace_expires_at": grace_exp,
        "surfaces": token_surfaces,
        "machine_hash": machine_hash,
    }


def _activation_for_surface(state: Dict[str, Any], surface: str) -> Dict[str, Any]:
    activations = state.get("activations") or {}
    return activations.get(surface) or {}


def status(path: Path, surface: str) -> Dict[str, Any]:
    normalized_surface = normalize_surface(surface)
    state = load_license_state(path)
    activation = _activation_for_surface(state, normalized_surface)
    token = activation.get("token")
    if not token:
        return {
            "ok": True,
            "licensed": False,
            "phase": "missing",
            "surface": normalized_surface,
            "message": f"No local license token found for surface '{normalized_surface}'",
        }

    payload = parse_and_verify_token(token)
    evaluation = evaluate_token(payload, normalized_surface)
    licensed = (
        evaluation["phase"] in {"active", "grace"}
        and evaluation["surface_ok"]
        and evaluation["machine_ok"]
    )

    return {
        "ok": True,
        "licensed": licensed,
        "phase": evaluation["phase"],
        "surface": normalized_surface,
        "surface_ok": evaluation["surface_ok"],
        "machine_ok": evaluation["machine_ok"],
        "expires_at": evaluation["expires_at"],
        "grace_expires_at": evaluation["grace_expires_at"],
        "surfaces": evaluation["surfaces"],
        "license_id": payload.get("license_id"),
        "activation_id": activation.get("activation_id")
        or payload.get("activation_id"),
        "benefit_id": payload.get("benefit_id"),
        "message": "License valid"
        if licensed
        else "License is not valid for this runtime",
    }


def _api_base(explicit: Optional[str]) -> str:
    base = (
        explicit
        or os.environ.get("RMBG_LICENSE_API_BASE_URL")
        or DEFAULT_LICENSE_API_BASE_URL
    )
    return base.rstrip("/")


def _resolve_ca_bundle_path() -> Optional[str]:
    for env_name in (
        "RMBG_LICENSE_CA_BUNDLE",
        "SSL_CERT_FILE",
        "REQUESTS_CA_BUNDLE",
    ):
        raw = os.environ.get(env_name)
        if not raw:
            continue

        path = Path(raw).expanduser().resolve()
        if not path.exists():
            raise RuntimeError(f"{env_name} points to missing CA bundle: {path}")

        return str(path)

    return None


def _license_ssl_context() -> ssl.SSLContext:
    ca_bundle = _resolve_ca_bundle_path()
    context = ssl.create_default_context(cafile=ca_bundle)

    if ca_bundle:
        return context

    try:
        import certifi
    except Exception:
        return context

    try:
        certifi_bundle = certifi.where()
        if certifi_bundle and Path(certifi_bundle).exists():
            context.load_verify_locations(cafile=certifi_bundle)
    except Exception:
        return context

    return context


def _post_json(url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    ssl_context = _license_ssl_context()

    try:
        with urllib.request.urlopen(req, timeout=20, context=ssl_context) as response:
            text = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        text = exc.read().decode("utf-8", errors="ignore")
        message = text
        try:
            parsed = json.loads(text)
            message = (
                parsed.get("error")
                or parsed.get("detail")
                or parsed.get("message")
                or text
            )
        except json.JSONDecodeError:
            message = text
        raise RuntimeError(f"License API error ({exc.code}): {message}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Failed to reach license API: {exc.reason}") from exc

    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise RuntimeError("License API returned invalid JSON") from exc


def activate_license(
    path: Path, key: str, surface: str, api_base: Optional[str]
) -> Dict[str, Any]:
    normalized_surface = normalize_surface(surface)
    machine_hash = machine_fingerprint()
    url = f"{_api_base(api_base)}/api/license/activate"
    response = _post_json(
        url,
        {
            "key": key,
            "surface": normalized_surface,
            "machine_hash": machine_hash,
        },
    )

    if not response.get("ok") or not response.get("token"):
        raise RuntimeError(response.get("error", "Activation failed"))

    state = load_license_state(path)
    activations = dict(state.get("activations") or {})
    activations[normalized_surface] = {
        "license_key": key,
        "token": response["token"],
        "activation_id": response.get("activation_id"),
        "surface": normalized_surface,
        "activated_at": int(time.time()),
        "api_base": _api_base(api_base),
    }
    save_license_state(path, {"version": 2, "activations": activations})

    return response


def refresh_license(
    path: Path, surface: str, api_base: Optional[str]
) -> Dict[str, Any]:
    normalized_surface = normalize_surface(surface)
    state = load_license_state(path)
    activations = dict(state.get("activations") or {})
    activation = activations.get(normalized_surface) or {}
    key = activation.get("license_key")
    activation_id = activation.get("activation_id")
    if not key:
        raise RuntimeError(
            f"No saved license key found for surface '{normalized_surface}'. Activate first."
        )
    if not activation_id:
        raise RuntimeError(
            f"No activation_id found for surface '{normalized_surface}'. Re-activate this surface online."
        )

    machine_hash = machine_fingerprint()
    url = f"{_api_base(api_base)}/api/license/refresh"
    response = _post_json(
        url,
        {
            "key": key,
            "surface": normalized_surface,
            "machine_hash": machine_hash,
            "activation_id": activation_id,
        },
    )

    if not response.get("ok") or not response.get("token"):
        raise RuntimeError(response.get("error", "Refresh failed"))

    activation["token"] = response["token"]
    activation["surface"] = normalized_surface
    activation["refreshed_at"] = int(time.time())
    if not activation.get("api_base"):
        activation["api_base"] = _api_base(api_base)
    activation["activation_id"] = response.get("activation_id", activation_id)
    activations[normalized_surface] = activation
    save_license_state(path, {"version": 2, "activations": activations})

    return response


def should_refresh(path: Path, surface: str) -> bool:
    normalized_surface = normalize_surface(surface)
    state = load_license_state(path)
    activation = _activation_for_surface(state, normalized_surface)
    token = activation.get("token")
    if not token:
        return False

    payload = parse_and_verify_token(token)
    exp = int(payload.get("exp", 0))
    now = int(time.time())
    return (
        exp - now <= LICENSE_REFRESH_THRESHOLD_SECONDS
        and normalized_surface in payload.get("surfaces", [])
    )


def ensure_surface_license(path: Path, surface: str) -> Dict[str, Any]:
    current = status(path, surface)
    if current.get("licensed"):
        return current
    raise RuntimeError(current.get("message", "License check failed"))


def ensure_required_surfaces(
    path: Path, surfaces: Iterable[str]
) -> Dict[str, Dict[str, Any]]:
    results: Dict[str, Dict[str, Any]] = {}
    for surface in surfaces:
        normalized_surface = normalize_surface(surface)
        current = status(path, normalized_surface)
        if not current.get("licensed"):
            raise RuntimeError(current.get("message", "License check failed"))
        results[normalized_surface] = current
    return results
