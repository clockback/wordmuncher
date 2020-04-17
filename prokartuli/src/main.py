__version__ = '0.1.0'

from prokartuli.src.application import app
# noinspection PyUnresolvedReferences
from prokartuli.src.modules import misc
# noinspection PyUnresolvedReferences
from prokartuli.src.modules.pages import (
    customize, languages, mainpage, results, test, test_sheet
)
from waitress import serve


# Contains settings
max_sheets = 5


def main():
    serve(app, host='0.0.0.0', port=8080)


if __name__ == '__main__':
    main()
