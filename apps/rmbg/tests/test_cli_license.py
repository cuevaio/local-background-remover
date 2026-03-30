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
