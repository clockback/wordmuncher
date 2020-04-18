from flask import render_template


from prokart.src.application import app
from prokart.src.modules.sql_handler import get_recent_translations


@app.route('/')
def main():
    return render_template("main.html", topbar=get_recent_translations())
