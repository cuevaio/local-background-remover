import argparse
from pathlib import Path

import pytest

from rmbg_cli import cli
from rmbg_cli.cli import build_parser


def test_license_activate_parser() -> None:
    parser = build_parser()
    args = parser.parse_args(
        ["license", "activate", "--key", "ABC-123", "--surface", "app"]
    )
    assert args.command == "license"
    assert args.license_command == "activate"
    assert args.key == "ABC-123"
    assert args.surface == "app"


def test_remove_parser_has_license_options() -> None:
    parser = build_parser()
    args = parser.parse_args(
        [
            "remove",
            "--input",
            "/tmp/in.png",
            "--api-base",
            "http://localhost:3000",
            "--surface",
            "desktop",
            "--require-surface",
            "cli",
        ]
    )
    assert args.api_base == "http://localhost:3000"
    assert args.surface == "desktop"
    assert args.require_surface == ["cli"]


def test_model_ensure_parser_accepts_surface() -> None:
    parser = build_parser()
    args = parser.parse_args(
        [
            "model",
            "ensure",
            "--surface",
            "desktop",
            "--require-surface",
            "cli",
            "--license-api",
            "http://localhost:3000",
        ]
    )
    assert args.surface == "desktop"
    assert args.require_surface == ["cli"]
    assert args.api_base == "http://localhost:3000"


def test_worker_parser_accepts_idle_seconds() -> None:
    parser = build_parser()
    args = parser.parse_args(["worker", "--idle-seconds", "120"])
    assert args.command == "worker"
    assert args.idle_seconds == 120


def test_worker_parser_accepts_license_surfaces() -> None:
    parser = build_parser()
    args = parser.parse_args(
        [
            "worker",
            "--surface",
            "desktop",
            "--require-surface",
            "cli",
            "--api-base",
            "http://localhost:3000",
        ]
    )
    assert args.surface == "desktop"
    assert args.require_surface == ["cli"]
    assert args.api_base == "http://localhost:3000"


def test_root_help_hides_surface_flags() -> None:
    parser = build_parser()

    help_output = parser.format_help()

    assert "--surface" not in help_output
    assert "--require-surface" not in help_output


def test_remove_help_hides_surface_flags(capsys) -> None:
    parser = build_parser()

    with pytest.raises(SystemExit):
        parser.parse_args(["remove", "--help"])

    help_output = capsys.readouterr().out

    assert "--surface" not in help_output
    assert "--require-surface" not in help_output


def test_resource_tracker_fd_detected_from_frozen_style_argv() -> None:
    fd = cli._resource_tracker_fd_from_argv(
        ["rmbg", "from multiprocessing.resource_tracker import main;main(9)"]
    )
    assert fd == 9


def test_resource_tracker_fd_detected_from_c_style_argv() -> None:
    fd = cli._resource_tracker_fd_from_argv(
        [
            "rmbg",
            "-c",
            "from multiprocessing.resource_tracker import main;main(7)",
        ]
    )
    assert fd == 7


def test_license_activate_rejects_desktop_surface_without_hosted_runtime(
    monkeypatch,
) -> None:
    captured: dict[str, object] = {}
    monkeypatch.setattr(
        cli, "resolve_license_file", lambda _value: Path("/tmp/license.json")
    )
    monkeypatch.setattr(
        cli, "_print", lambda payload, _as_json: captured.update(payload)
    )

    exit_code = cli.cmd_license_activate(
        argparse.Namespace(
            key="ABC-123",
            surface="desktop",
            license_file=None,
            api_base=None,
            json=True,
            format="json",
        )
    )

    assert exit_code == 6
    assert "desktop app only" in str(captured.get("error", ""))


def test_license_refresh_rejects_desktop_surface_without_hosted_runtime(
    monkeypatch,
) -> None:
    captured: dict[str, object] = {}
    monkeypatch.setattr(
        cli, "resolve_license_file", lambda _value: Path("/tmp/license.json")
    )
    monkeypatch.setattr(
        cli, "_print", lambda payload, _as_json: captured.update(payload)
    )

    exit_code = cli.cmd_license_refresh(
        argparse.Namespace(
            surface="desktop",
            license_file=None,
            api_base=None,
            json=True,
            format="json",
        )
    )

    assert exit_code == 6
    assert "desktop app only" in str(captured.get("error", ""))
