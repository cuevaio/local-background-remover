import argparse
from pathlib import Path

import pytest

from rmbg_cli import cli
from rmbg_cli.cli import build_parser
from rmbg_cli import upgrade as upgrade_module


def test_upgrade_parser_accepts_flags() -> None:
    parser = build_parser()
    args = parser.parse_args(
        [
            "upgrade",
            "--force",
            "--metadata-url",
            "http://localhost:3000/api/releases/latest",
            "--install-url",
            "http://localhost:3000/install",
            "--format",
            "json",
        ]
    )

    assert args.command == "upgrade"
    assert args.force is True
    assert args.metadata_url == "http://localhost:3000/api/releases/latest"
    assert args.install_url == "http://localhost:3000/install"
    assert args.format == "json"


def test_cmd_upgrade_returns_exit_1_when_upgrade_fails(monkeypatch) -> None:
    captured: dict[str, object] = {}

    def _raise(**_kwargs):
        raise RuntimeError("bad metadata")

    monkeypatch.setattr(cli, "run_upgrade", _raise)
    monkeypatch.setattr(
        cli, "_print", lambda payload, _as_json: captured.update(payload)
    )
    monkeypatch.setattr(cli.sys, "argv", ["/tmp/rmbg"])

    exit_code = cli.cmd_upgrade(
        argparse.Namespace(
            force=False,
            metadata_url="https://example.com/latest",
            install_url="https://example.com/install",
            json=True,
            format="json",
        )
    )

    assert exit_code == 1
    assert captured == {"ok": False, "error": "bad metadata"}


def test_run_upgrade_skips_when_current_matches_latest(monkeypatch) -> None:
    monkeypatch.setattr(upgrade_module.platform, "system", lambda: "Darwin")
    monkeypatch.setattr(
        upgrade_module,
        "fetch_latest_release",
        lambda _url: {"tag": "v0.5.2", "source": "metadata"},
    )

    def _unexpected(_url: str) -> str:
        raise AssertionError("install script should not be fetched")

    monkeypatch.setattr(upgrade_module, "fetch_install_script", _unexpected)

    payload = upgrade_module.run_upgrade(
        current_version="0.5.2",
        current_executable="/tmp/custom-rmbg",
    )

    assert payload["ok"] is True
    assert payload["upgraded"] is False
    assert payload["latest_version"] == "v0.5.2"
    assert payload["current_executable"] == str(Path("/tmp/custom-rmbg").resolve())
    assert payload["managed_executable"] == str(upgrade_module.MANAGED_EXECUTABLE)


def test_run_upgrade_force_installs_even_when_current_matches_latest(
    monkeypatch,
) -> None:
    calls: dict[str, object] = {}

    monkeypatch.setattr(upgrade_module.platform, "system", lambda: "Darwin")
    monkeypatch.setattr(
        upgrade_module,
        "fetch_latest_release",
        lambda _url: {"tag": "v0.5.2", "source": "metadata"},
    )
    monkeypatch.setattr(
        upgrade_module, "fetch_install_script", lambda _url: "#!/bin/bash"
    )

    def _capture_install(script: str, tag: str) -> None:
        calls["script"] = script
        calls["tag"] = tag

    def _capture_probe(executable) -> str:
        calls["probe"] = str(executable)
        return "0.5.2"

    monkeypatch.setattr(upgrade_module, "_run_installer", _capture_install)
    monkeypatch.setattr(upgrade_module, "_probe_version", _capture_probe)

    payload = upgrade_module.run_upgrade(
        current_version="0.5.2",
        current_executable="/tmp/other-rmbg",
        force=True,
    )

    assert payload["upgraded"] is True
    assert calls == {
        "script": "#!/bin/bash",
        "tag": "v0.5.2",
        "probe": str(upgrade_module.MANAGED_EXECUTABLE),
    }


def test_fetch_latest_release_rejects_missing_tag(monkeypatch) -> None:
    monkeypatch.setattr(upgrade_module, "_get_text", lambda _url: '{"ok": true}')

    with pytest.raises(RuntimeError, match="did not return a valid tag"):
        upgrade_module.fetch_latest_release("https://example.com/latest")


def test_run_upgrade_rejects_installed_version_mismatch(monkeypatch) -> None:
    monkeypatch.setattr(upgrade_module.platform, "system", lambda: "Darwin")
    monkeypatch.setattr(
        upgrade_module,
        "fetch_latest_release",
        lambda _url: {"tag": "v0.6.0", "source": "metadata"},
    )
    monkeypatch.setattr(
        upgrade_module, "fetch_install_script", lambda _url: "#!/bin/bash"
    )
    monkeypatch.setattr(upgrade_module, "_run_installer", lambda _script, _tag: None)
    monkeypatch.setattr(upgrade_module, "_probe_version", lambda _executable: "0.5.2")

    with pytest.raises(RuntimeError, match="did not match the requested release"):
        upgrade_module.run_upgrade(
            current_version="0.5.2",
            current_executable="/tmp/rmbg",
        )


def test_run_upgrade_rejects_non_macos(monkeypatch) -> None:
    monkeypatch.setattr(upgrade_module.platform, "system", lambda: "Linux")

    with pytest.raises(RuntimeError, match="macOS only"):
        upgrade_module.run_upgrade(
            current_version="0.5.2",
            current_executable="/tmp/rmbg",
        )
