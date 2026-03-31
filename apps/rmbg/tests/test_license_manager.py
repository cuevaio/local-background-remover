import base64
import json
import sys
import time
from pathlib import Path

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
import pytest

from rmbg_cli import license_manager


def _b64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _make_token(private_key: Ed25519PrivateKey, payload: dict) -> str:
    header = {"alg": "EdDSA", "typ": "RMBG-LIC-V1"}
    encoded_header = _b64url(json.dumps(header).encode("utf-8"))
    encoded_payload = _b64url(json.dumps(payload).encode("utf-8"))
    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    signature = private_key.sign(signing_input)
    return f"{encoded_header}.{encoded_payload}.{_b64url(signature)}"


def test_status_active_for_cli(tmp_path: Path, monkeypatch) -> None:
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    monkeypatch.setenv(
        "RMBG_LICENSE_PUBLIC_KEY", base64.b64encode(public_key).decode("utf-8")
    )
    monkeypatch.setattr(license_manager, "machine_fingerprint", lambda: "machine-abc")

    now = int(time.time())
    payload = {
        "exp": now + 3600,
        "grace_exp": now + 7200,
        "machine_hash": "machine-abc",
        "surfaces": ["cli"],
        "license_id": "lic_123",
        "benefit_id": "ben_cli",
    }
    token = _make_token(private_key, payload)

    license_file = tmp_path / "license.json"
    license_file.write_text(json.dumps({"token": token}), encoding="utf-8")

    result = license_manager.status(license_file, "cli")
    assert result["licensed"] is True
    assert result["phase"] == "active"
    assert result["machine_ok"] is True
    assert result["surface_ok"] is True


def test_status_uses_cached_public_key_when_env_missing(
    tmp_path: Path, monkeypatch
) -> None:
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    monkeypatch.delenv("RMBG_LICENSE_PUBLIC_KEY", raising=False)
    monkeypatch.setattr(license_manager, "machine_fingerprint", lambda: "machine-abc")

    now = int(time.time())
    payload = {
        "exp": now + 3600,
        "grace_exp": now + 7200,
        "machine_hash": "machine-abc",
        "surfaces": ["cli"],
    }
    token = _make_token(private_key, payload)

    license_file = tmp_path / "license.json"
    license_file.write_text(
        json.dumps(
            {
                "version": 2,
                "activations": {
                    "cli": {
                        "token": token,
                        "public_key": base64.b64encode(public_key).decode("utf-8"),
                    }
                },
            }
        ),
        encoding="utf-8",
    )

    result = license_manager.status(license_file, "cli")
    assert result["licensed"] is True


def test_status_rejects_surface_mismatch(tmp_path: Path, monkeypatch) -> None:
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    monkeypatch.setenv(
        "RMBG_LICENSE_PUBLIC_KEY", base64.b64encode(public_key).decode("utf-8")
    )
    monkeypatch.setattr(license_manager, "machine_fingerprint", lambda: "machine-abc")

    now = int(time.time())
    payload = {
        "exp": now + 3600,
        "grace_exp": now + 7200,
        "machine_hash": "machine-abc",
        "surfaces": ["cli"],
    }
    token = _make_token(private_key, payload)

    license_file = tmp_path / "license.json"
    license_file.write_text(json.dumps({"token": token}), encoding="utf-8")

    result = license_manager.status(license_file, "desktop")
    assert result["licensed"] is False
    assert result["phase"] == "missing"


def test_status_allows_grace_period(tmp_path: Path, monkeypatch) -> None:
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    monkeypatch.setenv(
        "RMBG_LICENSE_PUBLIC_KEY", base64.b64encode(public_key).decode("utf-8")
    )
    monkeypatch.setattr(license_manager, "machine_fingerprint", lambda: "machine-abc")

    now = int(time.time())
    payload = {
        "exp": now - 10,
        "grace_exp": now + 3600,
        "machine_hash": "machine-abc",
        "surfaces": ["cli"],
    }
    token = _make_token(private_key, payload)
    license_file = tmp_path / "license.json"
    license_file.write_text(json.dumps({"token": token}), encoding="utf-8")

    result = license_manager.status(license_file, "cli")
    assert result["licensed"] is True
    assert result["phase"] == "grace"


def test_status_rejects_expired_token(tmp_path: Path, monkeypatch) -> None:
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    monkeypatch.setenv(
        "RMBG_LICENSE_PUBLIC_KEY", base64.b64encode(public_key).decode("utf-8")
    )
    monkeypatch.setattr(license_manager, "machine_fingerprint", lambda: "machine-abc")

    now = int(time.time())
    payload = {
        "exp": now - 7200,
        "grace_exp": now - 3600,
        "machine_hash": "machine-abc",
        "surfaces": ["cli"],
    }
    token = _make_token(private_key, payload)
    license_file = tmp_path / "license.json"
    license_file.write_text(json.dumps({"token": token}), encoding="utf-8")

    result = license_manager.status(license_file, "cli")
    assert result["licensed"] is False
    assert result["phase"] == "expired"


def test_status_uses_surface_specific_activation(tmp_path: Path, monkeypatch) -> None:
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    monkeypatch.setenv(
        "RMBG_LICENSE_PUBLIC_KEY", base64.b64encode(public_key).decode("utf-8")
    )
    monkeypatch.setattr(license_manager, "machine_fingerprint", lambda: "machine-abc")

    now = int(time.time())
    desktop_payload = {
        "exp": now + 3600,
        "grace_exp": now + 7200,
        "machine_hash": "machine-abc",
        "surfaces": ["desktop"],
    }
    cli_payload = {
        "exp": now + 3600,
        "grace_exp": now + 7200,
        "machine_hash": "machine-abc",
        "surfaces": ["cli"],
    }

    desktop_token = _make_token(private_key, desktop_payload)
    cli_token = _make_token(private_key, cli_payload)

    license_file = tmp_path / "license.json"
    license_file.write_text(
        json.dumps(
            {
                "version": 2,
                "activations": {
                    "desktop": {"token": desktop_token},
                    "cli": {"token": cli_token},
                },
            }
        ),
        encoding="utf-8",
    )

    desktop_result = license_manager.status(license_file, "desktop")
    cli_result = license_manager.status(license_file, "cli")

    assert desktop_result["licensed"] is True
    assert cli_result["licensed"] is True


def test_ensure_required_surfaces_fails_when_one_missing(
    tmp_path: Path, monkeypatch
) -> None:
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key().public_bytes(Encoding.Raw, PublicFormat.Raw)
    monkeypatch.setenv(
        "RMBG_LICENSE_PUBLIC_KEY", base64.b64encode(public_key).decode("utf-8")
    )
    monkeypatch.setattr(license_manager, "machine_fingerprint", lambda: "machine-abc")

    now = int(time.time())
    cli_payload = {
        "exp": now + 3600,
        "grace_exp": now + 7200,
        "machine_hash": "machine-abc",
        "surfaces": ["cli"],
    }
    cli_token = _make_token(private_key, cli_payload)

    license_file = tmp_path / "license.json"
    license_file.write_text(
        json.dumps(
            {
                "version": 2,
                "activations": {
                    "cli": {"token": cli_token},
                },
            }
        ),
        encoding="utf-8",
    )

    with pytest.raises(RuntimeError):
        license_manager.ensure_required_surfaces(license_file, ["cli", "desktop"])


def test_ensure_desktop_hosted_runtime_accepts_matching_session(
    tmp_path: Path, monkeypatch
) -> None:
    session_file = tmp_path / "desktop-session.json"
    session_file.write_text(
        json.dumps({"nonce": "nonce-123", "expires_at": int(time.time()) + 60}),
        encoding="utf-8",
    )
    monkeypatch.setenv("RMBG_DESKTOP_SESSION_FILE", str(session_file))
    monkeypatch.setenv("RMBG_DESKTOP_SESSION_NONCE", "nonce-123")

    license_manager.ensure_desktop_hosted_runtime("desktop")


def test_ensure_desktop_hosted_runtime_rejects_missing_env(monkeypatch) -> None:
    monkeypatch.delenv("RMBG_DESKTOP_SESSION_FILE", raising=False)
    monkeypatch.delenv("RMBG_DESKTOP_SESSION_NONCE", raising=False)

    with pytest.raises(RuntimeError, match="desktop app only"):
        license_manager.ensure_desktop_hosted_runtime("desktop")


def test_ensure_desktop_hosted_runtime_rejects_nonce_mismatch(
    tmp_path: Path, monkeypatch
) -> None:
    session_file = tmp_path / "desktop-session.json"
    session_file.write_text(
        json.dumps({"nonce": "nonce-123", "expires_at": int(time.time()) + 60}),
        encoding="utf-8",
    )
    monkeypatch.setenv("RMBG_DESKTOP_SESSION_FILE", str(session_file))
    monkeypatch.setenv("RMBG_DESKTOP_SESSION_NONCE", "nonce-456")

    with pytest.raises(RuntimeError, match="desktop app only"):
        license_manager.ensure_desktop_hosted_runtime("desktop")


def test_ensure_desktop_hosted_runtime_rejects_expired_session(
    tmp_path: Path, monkeypatch
) -> None:
    session_file = tmp_path / "desktop-session.json"
    session_file.write_text(
        json.dumps({"nonce": "nonce-123", "expires_at": int(time.time()) - 1}),
        encoding="utf-8",
    )
    monkeypatch.setenv("RMBG_DESKTOP_SESSION_FILE", str(session_file))
    monkeypatch.setenv("RMBG_DESKTOP_SESSION_NONCE", "nonce-123")

    with pytest.raises(RuntimeError, match="desktop app only"):
        license_manager.ensure_desktop_hosted_runtime("desktop")


def test_machine_fingerprint_is_stable_with_device_file(
    tmp_path: Path, monkeypatch
) -> None:
    device_file = tmp_path / "device-id"
    monkeypatch.setenv("RMBG_LICENSE_DEVICE_ID_FILE", str(device_file))
    monkeypatch.delenv("RMBG_LICENSE_DEVICE_ID", raising=False)

    first = license_manager.machine_fingerprint()
    second = license_manager.machine_fingerprint()

    assert first == second
    assert device_file.exists()


def test_activate_license_persists_public_key(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setattr(license_manager, "machine_fingerprint", lambda: "machine-abc")
    monkeypatch.setattr(
        license_manager,
        "_post_json",
        lambda _url, _payload: {
            "ok": True,
            "token": "token-1",
            "activation_id": "activation-1",
            "public_key": "pubkey-1",
        },
    )

    license_file = tmp_path / "license.json"
    license_manager.activate_license(
        license_file, "KEY-1", "cli", "https://example.com"
    )
    state = license_manager.load_license_state(license_file)

    assert state["activations"]["cli"]["public_key"] == "pubkey-1"


def test_refresh_license_updates_cached_public_key(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setattr(license_manager, "machine_fingerprint", lambda: "machine-abc")
    monkeypatch.setattr(
        license_manager,
        "_post_json",
        lambda _url, _payload: {
            "ok": True,
            "token": "token-2",
            "activation_id": "activation-1",
            "public_key": "pubkey-2",
        },
    )

    license_file = tmp_path / "license.json"
    license_file.write_text(
        json.dumps(
            {
                "version": 2,
                "activations": {
                    "cli": {
                        "license_key": "KEY-1",
                        "token": "token-1",
                        "activation_id": "activation-1",
                        "public_key": "pubkey-1",
                    }
                },
            }
        ),
        encoding="utf-8",
    )

    license_manager.refresh_license(license_file, "cli", "https://example.com")
    state = license_manager.load_license_state(license_file)

    assert state["activations"]["cli"]["public_key"] == "pubkey-2"


def test_post_json_loads_certifi_bundle_when_no_env(monkeypatch) -> None:
    monkeypatch.delenv("RMBG_LICENSE_CA_BUNDLE", raising=False)
    monkeypatch.delenv("SSL_CERT_FILE", raising=False)
    monkeypatch.delenv("REQUESTS_CA_BUNDLE", raising=False)

    class _Context:
        def __init__(self) -> None:
            self.loaded: list[str] = []

        def load_verify_locations(self, cafile=None, _capath=None, _cadata=None):
            if cafile:
                self.loaded.append(cafile)

    created: dict[str, object] = {}

    def _fake_context(*args, **kwargs):
        created["cafile"] = kwargs.get("cafile")
        context = _Context()
        created["context"] = context
        return context

    class _Response:
        def __enter__(self):
            return self

        def __exit__(self, _exc_type, _exc, _tb):
            return False

        def read(self) -> bytes:
            return b'{"ok": true}'

    seen: dict[str, object] = {}

    def _fake_urlopen(_req, **kwargs):
        seen["context"] = kwargs.get("context")
        return _Response()

    class _Certifi:
        @staticmethod
        def where() -> str:
            return __file__

    monkeypatch.setattr(license_manager.ssl, "create_default_context", _fake_context)
    monkeypatch.setattr(license_manager.urllib.request, "urlopen", _fake_urlopen)
    monkeypatch.setitem(sys.modules, "certifi", _Certifi)

    result = license_manager._post_json("https://example.com", {"hello": "world"})

    assert result["ok"] is True
    assert created["cafile"] is None
    assert seen["context"] is created["context"]
    assert created["context"].loaded == [__file__]


def test_resolve_ca_bundle_path_prefers_explicit_env(
    tmp_path: Path, monkeypatch
) -> None:
    bundle = tmp_path / "ca.pem"
    bundle.write_text("-----BEGIN CERTIFICATE-----\n", encoding="utf-8")

    monkeypatch.setenv("RMBG_LICENSE_CA_BUNDLE", str(bundle))
    monkeypatch.delenv("SSL_CERT_FILE", raising=False)
    monkeypatch.delenv("REQUESTS_CA_BUNDLE", raising=False)

    assert license_manager._resolve_ca_bundle_path() == str(bundle.resolve())


def test_resolve_ca_bundle_path_errors_for_missing_file(monkeypatch) -> None:
    monkeypatch.setenv("RMBG_LICENSE_CA_BUNDLE", "/tmp/does-not-exist-rmbg-ca.pem")

    with pytest.raises(RuntimeError, match="RMBG_LICENSE_CA_BUNDLE"):
        license_manager._resolve_ca_bundle_path()
