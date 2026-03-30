from rmbg_cli.io import default_output_path


def test_default_output_path_suffix() -> None:
    output = default_output_path("/tmp/cat.jpg")
    assert output.endswith("/tmp/cat_rmbg.png")
