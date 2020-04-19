# Builtins
from typing import Tuple

# Installed packages
from flask import render_template

# Local imports
from prokart.src.application import app
from prokart.src.modules.sql_handler import get_recent_translations


@app.route('/')
def main() -> Tuple[str, int]:
    """Returns the page for the main menu.
    :return: The main menu page.
    :rtype: Tuple[str, int]
    """
    return render_template("main.html", topbar=get_recent_translations()), 200
