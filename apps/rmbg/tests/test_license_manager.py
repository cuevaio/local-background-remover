import base64
import json
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
