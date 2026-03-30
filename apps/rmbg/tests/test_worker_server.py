import pytest
from PIL import Image

from rmbg_cli import worker_server


def test_handle_request_remove_passes_url_to_shared_loader(monkeypatch) -> None:
    seen: dict[str, str] = {}

    monkeypatch.setattr(
        worker_server, "ensure_local_model", lambda *_args, **_kwargs: False
    )
    monkeypatch.setattr(
        worker_server,
        "_ensure_model_loaded",
        lambda _state, _model_dir: None,
    )

    def _fake_load_image(input_ref: str):
        seen["input_ref"] = input_ref
        return Image.new("RGB", (1, 1), (0, 0, 0))

    monkeypatch.setattr(worker_server, "load_image", _fake_load_image)
    monkeypatch.setattr(worker_server, "remove_background", lambda image, *_args: image)
    monkeypatch.setattr(
        worker_server,
        "save_png",
        lambda _image, output_path: output_path,
    )

    state = worker_server.WorkerState()
    request = {
        "action": "remove",
        "payload": {
            "input_path": "https://example.com/photo.jpg",
            "output_path": "/tmp/out.png",
        },
    }

    result = worker_server._handle_request(state, request)

    assert result["ok"] is True
    assert seen["input_ref"] == "https://example.com/photo.jpg"


def test_worker_remove_surfaces_url_loader_errors(monkeypatch) -> None:
    monkeypatch.setattr(
        worker_server, "ensure_local_model", lambda *_args, **_kwargs: False
    )
    monkeypatch.setattr(
        worker_server,
        "_ensure_model_loaded",
        lambda _state, _model_dir: None,
    )
    monkeypatch.setattr(
        worker_server,
        "load_image",
        lambda _input_ref: (_ for _ in ()).throw(RuntimeError("download failed")),
    )

    state = worker_server.WorkerState()
    request = {
        "action": "remove",
        "payload": {
            "input_path": "https://example.com/photo.jpg",
            "output_path": "/tmp/out.png",
        },
    }

    with pytest.raises(RuntimeError, match="download failed"):
        worker_server._handle_request(state, request)
