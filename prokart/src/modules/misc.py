# Installed packages
from flask import render_template
from werkzeug.exceptions import NotFound

# Local imports
from prokart.src.application import app


@app.errorhandler(404)
def protocol_404(_: NotFound):
    """
    :param NotFound _: The exception and corresponding HTML.
    :return: The 404 page.
    :rtype: Tuple[str, int]
    """
    return render_template("not_found.html"), 404
