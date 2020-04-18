__version__ = '0.1.0'

import webbrowser

from waitress import serve

from prokart.src.application import app
# noinspection PyUnresolvedReferences
from prokart.src.modules import misc
# noinspection PyUnresolvedReferences
from prokart.src.modules.pages import (
    create, languages, mainpage, results, test, test_sheet
)
from prokart.src.modules.sql_handler import get_connection

webbrowser.open("http://0.0.0.0:8080")


def main():
    get_connection(check=True)
    try:
        serve(app, host='0.0.0.0', port=8080, threads=6)
    except OSError:
        raise OSError("Application already running at 0.0.0.0:8000")


if __name__ == '__main__':
    main()
