__all__ = [
    'misc', 'create', 'languages', 'mainpage', 'results', 'test', 'test_sheet'
]
__author__ = 'Elliot Paton-Simpson'
__version__ = '0.1.0'

# Builtins
import argparse
import webbrowser

# Installed packages
from waitress import serve

# Local imports
from prokart.src.application import app
from prokart.src.modules import misc
from prokart.src.modules.pages import (
    create, languages, mainpage, results, test, test_sheet
)


def main() -> None:
    """Establishes a connection to the SQLite database and starts up
    the server.
    :return: None
    """
    # Opens the application in the user's browser unless directed
    # otherwise.
    if not app.config["SUPPRESS"]:
        webbrowser.open("http://0.0.0.0:8080")

    # Attempts to host the application.
    try:
        serve(
            app, host='0.0.0.0', port=8080, threads=6,
            clear_untrusted_proxy_headers=True
        )

    # Raises a helpful error if the port is already occupied.
    except OSError:
        raise OSError("Application already running at 0.0.0.0:8000")


# Starts up the application.
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--suppress", help="Prevent Firefox from opening automatically.",
        action="store_true"
    )
    parser.add_argument(
        "--path", help="The directory containing the database you are using.",
        default=None
    )
    parser.add_argument(
        "--db", help="The name of the database you are using.",
        default="vocab.db"
    )
    args = parser.parse_args()
    app.config["SUPPRESS"] = args.suppress
    app.config["PATH"] = args.path
    app.config["DATABASE"] = args.db
    main()
