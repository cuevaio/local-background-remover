import socket
from io import BytesIO
from pathlib import Path
from urllib import error, parse, request

from PIL import Image, ImageOps

DOWNLOAD_TIMEOUT_SECONDS = 20
MAX_DOWNLOAD_BYTES = 20 * 1024 * 1024
READ_CHUNK_BYTES = 64 * 1024


def _is_url_reference(value: str) -> bool:
    parsed = parse.urlparse(value)
    return bool(parsed.scheme and parsed.netloc)


def is_http_url(value: str) -> bool:
    parsed = parse.urlparse(value)
    return parsed.scheme.lower() in {"http", "https"} and bool(parsed.netloc)


def _sanitize_filename_stem(raw: str) -> str:
    filtered = []
    for char in raw:
        if char.isalnum() or char in {"-", "_", "."}:
            filtered.append(char)
        else:
            filtered.append("_")
    return "".join(filtered).strip("._-")


def _derive_output_stem_from_url(url: str) -> str:
    parsed = parse.urlparse(url)
    basename = Path(parse.unquote(parsed.path)).name
    if not basename:
        return ""
    return _sanitize_filename_stem(Path(basename).stem)


def _validate_image_response(url: str, content_type: str | None) -> None:
    if not content_type:
        raise RuntimeError(f"URL did not return an image (missing Content-Type): {url}")

    media_type = content_type.split(";", 1)[0].strip().lower()
    if not media_type.startswith("image/"):
        raise RuntimeError(f"URL did not return an image (Content-Type: {media_type})")


def _fetch_url_image_bytes(url: str) -> bytes:
    req = request.Request(
        url,
        headers={
            "Accept": "image/*,*/*;q=0.8",
            "User-Agent": "rmbg-cli",
        },
        method="GET",
    )

    try:
        with request.urlopen(req, timeout=DOWNLOAD_TIMEOUT_SECONDS) as response:
            _validate_image_response(url, response.headers.get("Content-Type"))

            content_length = response.headers.get("Content-Length")
            if content_length:
                try:
                    expected = int(content_length)
                except ValueError:
                    expected = None
                else:
                    if expected > MAX_DOWNLOAD_BYTES:
                        raise RuntimeError(
                            "Input image exceeds 20MB limit "
                            f"(Content-Length: {expected} bytes)."
                        )

            chunks: list[bytes] = []
            total = 0
            while True:
                chunk = response.read(READ_CHUNK_BYTES)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_DOWNLOAD_BYTES:
                    raise RuntimeError(
                        "Input image exceeds 20MB limit while downloading."
                    )
                chunks.append(chunk)

            if total == 0:
                raise RuntimeError("Downloaded image is empty.")

            return b"".join(chunks)
    except error.HTTPError as exc:
        raise RuntimeError(
            f"Failed to download image from URL (HTTP {exc.code}): {url}"
        ) from exc
    except error.URLError as exc:
        if isinstance(exc.reason, socket.timeout):
            raise RuntimeError(
                f"Failed to download image from URL within {DOWNLOAD_TIMEOUT_SECONDS}s"
            ) from exc
        raise RuntimeError(f"Failed to download image from URL: {exc.reason}") from exc


def _decode_image_bytes(raw: bytes) -> Image.Image:
    try:
        with Image.open(BytesIO(raw)) as image:
            return ImageOps.exif_transpose(image).convert("RGB")
    except Exception as exc:
        raise RuntimeError("Downloaded content is not a valid image file.") from exc


def load_image(path: str) -> Image.Image:
    if _is_url_reference(path):
        if not is_http_url(path):
            scheme = parse.urlparse(path).scheme.lower()
            raise RuntimeError(
                f"Unsupported input URL scheme '{scheme}'. Only http/https are allowed."
            )
        raw = _fetch_url_image_bytes(path)
        return _decode_image_bytes(raw)

    with Image.open(path) as image:
        return ImageOps.exif_transpose(image).convert("RGB")


def default_output_path(input_path: str) -> str:
    if is_http_url(input_path):
        stem = _derive_output_stem_from_url(input_path) or "image"
        return str(Path.cwd() / f"{stem}_rmbg.png")

    source = Path(input_path)
    return str(source.with_name(f"{source.stem}_rmbg.png"))


def save_png(image: Image.Image, output_path: str) -> str:
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(out)
    return str(out.resolve())
