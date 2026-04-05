import socket
from io import BytesIO
from pathlib import Path
from urllib import error

import pytest
from PIL import Image

from rmbg_cli import io as io_module
from rmbg_cli.io import default_output_path, load_image


class _FakeResponse:
    def __init__(self, data: bytes, headers: dict[str, str] | None = None) -> None:
        self._stream = BytesIO(data)
        self.headers = headers or {}

    def read(self, size: int = -1) -> bytes:
        return self._stream.read(size)

    def __enter__(self):
        return self

    def __exit__(self, _exc_type, _exc, _tb):
        return False


def _png_bytes() -> bytes:
    buffer = BytesIO()
    Image.new("RGB", (2, 2), (255, 10, 10)).save(buffer, format="PNG")
    return buffer.getvalue()


def test_default_output_path_suffix_for_local_file_unchanged() -> None:
    output = default_output_path("/tmp/cat.jpg")
    assert output.endswith("/tmp/cat_rmbg.png")


def test_default_output_path_for_url_uses_sanitized_basename_in_cwd() -> None:
    output = default_output_path("https://example.com/path/cat%20photo.jpg?token=abc")
    assert Path(output).parent == Path.cwd()
    assert Path(output).name == "cat_photo_rmbg.png"


def test_default_output_path_for_url_falls_back_to_image_rmbg_png() -> None:
    output = default_output_path("https://example.com/")
    assert Path(output).parent == Path.cwd()
    assert Path(output).name == "image_rmbg.png"


def test_load_image_from_url_success_returns_rgb_image(monkeypatch) -> None:
    payload = _png_bytes()
    expected_context = object()

    monkeypatch.setattr(io_module, "build_ssl_context", lambda: expected_context)

    def _fake_urlopen(_req, timeout: int, context=None):
        assert timeout == io_module.DOWNLOAD_TIMEOUT_SECONDS
        assert context is expected_context
        return _FakeResponse(
            payload,
            {
                "Content-Type": "image/png",
                "Content-Length": str(len(payload)),
            },
        )

    monkeypatch.setattr(io_module.request, "urlopen", _fake_urlopen)

    image = load_image("https://example.com/cat.png")
    assert image.mode == "RGB"
    assert image.size == (2, 2)


def test_load_image_rejects_non_http_scheme() -> None:
    with pytest.raises(RuntimeError, match="Unsupported input URL scheme"):
        load_image("ftp://example.com/cat.png")


def test_load_image_rejects_non_image_content_type(monkeypatch) -> None:
    monkeypatch.setattr(io_module, "build_ssl_context", lambda: object())

    def _fake_urlopen(_req, timeout: int, context=None):
        assert timeout == io_module.DOWNLOAD_TIMEOUT_SECONDS
        assert context is not None
        return _FakeResponse(b"<html></html>", {"Content-Type": "text/html"})

    monkeypatch.setattr(io_module.request, "urlopen", _fake_urlopen)

    with pytest.raises(RuntimeError, match="URL did not return an image"):
        load_image("https://example.com/not-image")


def test_load_image_rejects_content_length_over_20mb(monkeypatch) -> None:
    too_large = io_module.MAX_DOWNLOAD_BYTES + 1

    monkeypatch.setattr(io_module, "build_ssl_context", lambda: object())

    def _fake_urlopen(_req, timeout: int, context=None):
        assert timeout == io_module.DOWNLOAD_TIMEOUT_SECONDS
        assert context is not None
        return _FakeResponse(
            b"x",
            {"Content-Type": "image/png", "Content-Length": str(too_large)},
        )

    monkeypatch.setattr(io_module.request, "urlopen", _fake_urlopen)

    with pytest.raises(RuntimeError, match="exceeds 20MB limit"):
        load_image("https://example.com/too-large.png")


def test_load_image_rejects_stream_exceeding_20mb_without_content_length(
    monkeypatch,
) -> None:
    payload = b"x" * (io_module.MAX_DOWNLOAD_BYTES + 1)

    monkeypatch.setattr(io_module, "build_ssl_context", lambda: object())

    def _fake_urlopen(_req, timeout: int, context=None):
        assert timeout == io_module.DOWNLOAD_TIMEOUT_SECONDS
        assert context is not None
        return _FakeResponse(payload, {"Content-Type": "image/png"})

    monkeypatch.setattr(io_module.request, "urlopen", _fake_urlopen)

    with pytest.raises(RuntimeError, match="exceeds 20MB limit while downloading"):
        load_image("https://example.com/streamed-too-large.png")


def test_load_image_reports_timeout_actionably(monkeypatch) -> None:
    monkeypatch.setattr(io_module, "build_ssl_context", lambda: object())

    def _fake_urlopen(_req, timeout: int, context=None):
        assert timeout == io_module.DOWNLOAD_TIMEOUT_SECONDS
        assert context is not None
        raise error.URLError(socket.timeout())

    monkeypatch.setattr(io_module.request, "urlopen", _fake_urlopen)

    with pytest.raises(RuntimeError, match="within 20s"):
        load_image("https://example.com/slow.png")
