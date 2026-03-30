import pytest
import torch

from rmbg_cli import inference


def test_get_runtime_prefers_cuda(monkeypatch) -> None:
    monkeypatch.setattr(inference.torch.cuda, "is_available", lambda: True)

    mps_backend = getattr(inference.torch.backends, "mps", None)
    if mps_backend is not None:
        monkeypatch.setattr(mps_backend, "is_available", lambda: True)

    device, dtype = inference.get_runtime()
    assert device.type == "cuda"
    assert dtype == torch.float16


def test_get_runtime_uses_mps_when_cuda_unavailable(monkeypatch) -> None:
    monkeypatch.setattr(inference.torch.cuda, "is_available", lambda: False)

    mps_backend = getattr(inference.torch.backends, "mps", None)
    if mps_backend is None:
        pytest.skip("MPS backend not exposed by this torch build")

    monkeypatch.setattr(mps_backend, "is_available", lambda: True)

    device, dtype = inference.get_runtime()
    assert device.type == "mps"
    assert dtype == torch.float32


def test_get_runtime_falls_back_to_cpu(monkeypatch) -> None:
    monkeypatch.setattr(inference.torch.cuda, "is_available", lambda: False)

    mps_backend = getattr(inference.torch.backends, "mps", None)
    if mps_backend is not None:
        monkeypatch.setattr(mps_backend, "is_available", lambda: False)

    device, dtype = inference.get_runtime()
    assert device.type == "cpu"
    assert dtype == torch.float32
