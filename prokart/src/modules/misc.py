from flask import render_template
from werkzeug.exceptions import NotFound

from prokart.src.application import app


@app.errorhandler(404)
def protocol_404(e: NotFound):
    # TODO: return render_template("404.html"), 404
    return e.get_body(), 404
