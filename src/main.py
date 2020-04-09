from src.application import app
# noinspection PyUnresolvedReferences
from src.modules.pages import mainpage, languages, test, customize
from logging import getLogger, ERROR


# Suppresses superfluous output.
log = getLogger('werkzeug')
log.setLevel(ERROR)

# Contains settings
max_sheets = 5


if __name__ == '__main__':
    app.run('localhost', 5000, debug=True)
