from src.application import app
# noinspection PyUnresolvedReferences
import src.modules.misc
# noinspection PyUnresolvedReferences
from src.modules.pages import (
    customize, languages, mainpage, results, test, test_sheet
)
from logging import getLogger, ERROR


# Suppresses superfluous output.
log = getLogger('werkzeug')
log.setLevel(ERROR)

# Contains settings
max_sheets = 5


if __name__ == '__main__':
    app.run('prokartuli', debug=True)
