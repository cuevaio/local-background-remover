import os
import ssl
from pathlib import Path
from typing import Optional


def resolve_ca_bundle_path() -> Optional[str]:
    for env_name in (
        "RMBG_LICENSE_CA_BUNDLE",
        "SSL_CERT_FILE",
        "REQUESTS_CA_BUNDLE",
    ):
        raw = os.environ.get(env_name)
        if not raw:
            continue

        path = Path(raw).expanduser().resolve()
        if not path.exists():
            raise RuntimeError(f"{env_name} points to missing CA bundle: {path}")

        return str(path)

    return None


def build_ssl_context() -> ssl.SSLContext:
    ca_bundle = resolve_ca_bundle_path()
    context = ssl.create_default_context()

    loaded_bundles: set[str] = set()

    if ca_bundle:
        context.load_verify_locations(cafile=ca_bundle)
        loaded_bundles.add(ca_bundle)

    try:
        import certifi
    except Exception:
        return context

    try:
        certifi_bundle = certifi.where()
        if (
            certifi_bundle
            and Path(certifi_bundle).exists()
            and certifi_bundle not in loaded_bundles
        ):
            context.load_verify_locations(cafile=certifi_bundle)
    except Exception:
        return context

    return context
