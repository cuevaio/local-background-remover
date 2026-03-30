import argparse
from pathlib import Path

from PIL import Image

from rmbg_cli import cli
from rmbg_cli import inference


def _remove_args(input_ref: str, output: str | None = None) -> argparse.Namespace:
    return argparse.Namespace(
        input=input_ref,
        output=output,
        model_dir=None,
        surface="cli",
        require_surface=[],
        license_file=None,
        api_base=None,
        progress="none",
        json=True,
        format="json",
    )


def _stub_license_and_model(monkeypatch) -> None:
    monkeypatch.setattr(
        cli, "resolve_license_file", lambda _value: Path("/tmp/license.json")
    )
    monkeypatch.setattr(
        cli,
        "ensure_required_surfaces",
        lambda _path, _surfaces: None,
    )
    monkeypatch.setattr(cli, "should_refresh", lambda _path, _surface: False)
    monkeypatch.setattr(cli, "ensure_local_model", lambda *_args, **_kwargs: False)


def test_cmd_remove_returns_exit_2_when_url_read_fails(monkeypatch) -> None:
    _stub_license_and_model(monkeypatch)

    captured: dict[str, object] = {}
    monkeypatch.setattr(
        cli, "_print", lambda payload, _as_json: captured.update(payload)
    )
    monkeypatch.setattr(
        cli,
        "load_image",
        lambda _input: (_ for _ in ()).throw(RuntimeError("network failed")),
    )

    exit_code = cli.cmd_remove(_remove_args("https://example.com/cat.png"))

    assert exit_code == 2
    assert str(captured.get("error", "")).startswith("Failed to read input image")


def test_cmd_remove_success_payload_uses_raw_url_for_input_path(monkeypatch) -> None:
    _stub_license_and_model(monkeypatch)

    captured: dict[str, object] = {}
    monkeypatch.setattr(
        cli, "_print", lambda payload, _as_json: captured.update(payload)
    )
    monkeypatch.setattr(
        cli, "load_image", lambda _input: Image.new("RGB", (1, 1), (0, 0, 0))
    )
    monkeypatch.setattr(
        inference, "load_model", lambda _model_dir: (object(), "cpu", "float32")
    )
    monkeypatch.setattr(inference, "remove_background", lambda image, *_args: image)
    monkeypatch.setattr(cli, "save_png", lambda _image, _output: "/tmp/image_rmbg.png")

    url = "https://example.com/folder/cat.png"
    exit_code = cli.cmd_remove(_remove_args(url))

    assert exit_code == 0
    assert captured.get("ok") is True
    assert captured.get("input_path") == url
    assert captured.get("output_path") == "/tmp/image_rmbg.png"


def test_cmd_remove_uses_url_default_output_when_output_omitted(monkeypatch) -> None:
    _stub_license_and_model(monkeypatch)

    captured: dict[str, object] = {}
    seen: dict[str, str] = {}

    monkeypatch.setattr(
        cli, "_print", lambda payload, _as_json: captured.update(payload)
    )
    monkeypatch.setattr(
        cli, "load_image", lambda _input: Image.new("RGB", (1, 1), (0, 0, 0))
    )
    monkeypatch.setattr(
        inference, "load_model", lambda _model_dir: (object(), "cpu", "float32")
    )
    monkeypatch.setattr(inference, "remove_background", lambda image, *_args: image)

    def _fake_save_png(_image, output_path: str) -> str:
        seen["output_path"] = output_path
        return output_path

    monkeypatch.setattr(cli, "save_png", _fake_save_png)

    exit_code = cli.cmd_remove(_remove_args("https://example.com/path/cat%20photo.jpg"))

    assert exit_code == 0
    assert Path(seen["output_path"]).parent == Path.cwd()
    assert Path(seen["output_path"]).name == "cat_photo_rmbg.png"
    assert captured.get("output_path") == seen["output_path"]
