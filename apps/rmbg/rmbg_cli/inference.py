from pathlib import Path
from typing import Tuple

import torch
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageSegmentation

from .config import set_runtime_offline_env

torch.set_float32_matmul_precision(["high", "highest"][0])

TRANSFORM_IMAGE = transforms.Compose(
    [
        transforms.Resize((1024, 1024)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ]
)


def get_runtime() -> Tuple[torch.device, torch.dtype]:
    if torch.cuda.is_available():
        return torch.device("cuda"), torch.float16

    mps_backend = getattr(torch.backends, "mps", None)
    if mps_backend is not None and mps_backend.is_available():
        return torch.device("mps"), torch.float32

    return torch.device("cpu"), torch.float32


def load_model(
    model_dir: Path,
) -> Tuple[AutoModelForImageSegmentation, torch.device, torch.dtype]:
    set_runtime_offline_env()
    device, dtype = get_runtime()
    model = AutoModelForImageSegmentation.from_pretrained(
        str(model_dir),
        trust_remote_code=True,
        local_files_only=True,
        dtype=dtype,
        low_cpu_mem_usage=True,
    )
    model.to(device=device, dtype=dtype)
    model.eval()
    return model, device, dtype


def remove_background(
    image: Image.Image,
    model: AutoModelForImageSegmentation,
    device: torch.device,
    dtype: torch.dtype,
) -> Image.Image:
    image = image.convert("RGB")
    image_size = image.size
    input_images = TRANSFORM_IMAGE(image).unsqueeze(0).to(device, dtype=dtype)

    with torch.inference_mode():
        preds = model(input_images)[-1].sigmoid().cpu()

    pred = preds[0].squeeze()
    mask = transforms.ToPILImage()(pred).resize(image_size)
    output = image.copy()
    output.putalpha(mask)
    return output
