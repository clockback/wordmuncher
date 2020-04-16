__version__ = '0.1.0'

from prokartuli.application import app
# noinspection PyUnresolvedReferences
import prokartuli.modules.misc
# noinspection PyUnresolvedReferences
from .modules.pages import (
    customize, languages, mainpage, results, test, test_sheet
)
from logging import getLogger, ERROR


# Suppresses superfluous output.
log = getLogger('werkzeug')
log.setLevel(ERROR)

# Contains settings
max_sheets = 5


def main():
    app.run('prokartuli', debug=True)


if __name__ == '__main__':
    main()
