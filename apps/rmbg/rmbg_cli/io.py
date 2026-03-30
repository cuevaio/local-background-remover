from pathlib import Path

from PIL import Image, ImageOps


def load_image(path: str) -> Image.Image:
    with Image.open(path) as image:
        return ImageOps.exif_transpose(image).convert("RGB")


def default_output_path(input_path: str) -> str:
    source = Path(input_path)
    return str(source.with_name(f"{source.stem}_rmbg.png"))


def save_png(image: Image.Image, output_path: str) -> str:
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out)
    return str(out.resolve())
