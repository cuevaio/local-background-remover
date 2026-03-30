import json
import os
from pathlib import Path

import pytest

from rmbg_cli import model_manager
from rmbg_cli.model_manager import ensure_local_model, validate_local_model_dir


def test_validate_local_model_dir_minimal(tmp_path: Path) -> None:
    config = {"auto_map": {"AutoModelForImageSegmentation": "birefnet.BiRefNet"}}
    (tmp_path / "config.json").write_text(json.dumps(config), encoding="utf-8")
    (tmp_path / "model.safetensors").write_text("weights", encoding="utf-8")
    (tmp_path / "birefnet.py").write_text("class BiRefNet: ...", encoding="utf-8")

    validate_local_model_dir(tmp_path)


def test_validate_local_model_dir_missing_config(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        validate_local_model_dir(tmp_path)


def _write_minimal_model(local_dir: str) -> None:
    model_path = Path(local_dir)
    (model_path / "config.json").write_text("{}", encoding="utf-8")
    (model_path / "model.safetensors").write_text("weights", encoding="utf-8")


def test_ensure_local_model_uses_public_download_when_no_token(
    tmp_path: Path, monkeypatch
) -> None:
    observed: dict[str, object] = {}
    monkeypatch.delenv("HF_TOKEN", raising=False)
    monkeypatch.delenv("HUGGINGFACE_HUB_TOKEN", raising=False)
    monkeypatch.delenv("HF_HUB_DISABLE_PROGRESS_BARS", raising=False)

    def _fake_snapshot_download(*, repo_id: str, local_dir: str, token: object) -> None:
        observed["repo_id"] = repo_id
        observed["token"] = token
        _write_minimal_model(local_dir)

    monkeypatch.setattr(model_manager, "snapshot_download", _fake_snapshot_download)

    bootstrapped = ensure_local_model(tmp_path, allow_download=True)

    assert bootstrapped is True
    assert observed["repo_id"] == model_manager.MODEL_REPO_ID
    assert observed["token"] is False
    assert os.environ.get("HF_HUB_DISABLE_PROGRESS_BARS") == "1"


def test_ensure_local_model_uses_hf_token_when_available(
    tmp_path: Path, monkeypatch
) -> None:
    observed: dict[str, object] = {}
    monkeypatch.setenv("HF_TOKEN", "hf_test_token")

    def _fake_snapshot_download(*, repo_id: str, local_dir: str, token: object) -> None:
        observed["repo_id"] = repo_id
        observed["token"] = token
        _write_minimal_model(local_dir)

    monkeypatch.setattr(model_manager, "snapshot_download", _fake_snapshot_download)

    bootstrapped = ensure_local_model(tmp_path, allow_download=True)

    assert bootstrapped is True
    assert observed["repo_id"] == model_manager.MODEL_REPO_ID
    assert observed["token"] == "hf_test_token"
