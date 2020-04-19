__version__ = '0.1.0'

# Builtins
import webbrowser

# Installed packages
from waitress import serve

# Local imports
from prokart.src.application import app
# noinspection PyUnresolvedReferences
from prokart.src.modules import misc
# noinspection PyUnresolvedReferences
from prokart.src.modules.pages import (
    create, languages, mainpage, results, test, test_sheet
)
from prokart.src.modules.sql_handler import get_connection


def main() -> None:
    """Establishes a connection to the SQLite database and starts up
    the server.
    :return: None
    """
    # Makes sure that the database is constructed.
    get_connection(check=True)

    # Opens the application in the user's browser.
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
    main()
