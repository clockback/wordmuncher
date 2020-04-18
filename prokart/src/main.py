__version__ = '0.1.0'

from waitress import serve

from prokart.src.application import app
# noinspection PyUnresolvedReferences
from prokart.src.modules import misc
# noinspection PyUnresolvedReferences
from prokart.src.modules.pages import (
    customize, languages, mainpage, results, test, test_sheet
)
from prokart.src.modules.sql_handler import get_connection


# Contains settings
max_sheets = 5


def main():
    get_connection(check=True)
    serve(app, host='0.0.0.0', port=8080, threads=6)


if __name__ == '__main__':
    main()
