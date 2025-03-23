import logging
from flask import Blueprint, render_template

logger = logging.getLogger(__name__)

home_bp = Blueprint("home", __name__)


@home_bp.route("/")
def home():
    return render_template("home.html")


@home_bp.route("/notebook/<path:filename>")
def notebook(filename):
    # Log notebook access
    logger.info(f"📖 Notebook opened: {filename}")
    return render_template("notebook.html", filename=filename)
