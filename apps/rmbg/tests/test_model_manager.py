import json
from pathlib import Path

import pytest

from rmbg_cli.model_manager import validate_local_model_dir


def test_validate_local_model_dir_minimal(tmp_path: Path) -> None:
    config = {"auto_map": {"AutoModelForImageSegmentation": "birefnet.BiRefNet"}}
    (tmp_path / "config.json").write_text(json.dumps(config), encoding="utf-8")
    (tmp_path / "model.safetensors").write_text("weights", encoding="utf-8")
    (tmp_path / "birefnet.py").write_text("class BiRefNet: ...", encoding="utf-8")

    validate_local_model_dir(tmp_path)


def test_validate_local_model_dir_missing_config(tmp_path: Path) -> None:
    with pytest.raises(FileNotFoundError):
        validate_local_model_dir(tmp_path)
