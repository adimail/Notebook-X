import logging
from flask import Flask, render_template
from app.blueprints.files import files_bp
from app.blueprints.kernel import kernel_bp
from app.blueprints.home import home_bp
from werkzeug.serving import WSGIRequestHandler


def create_app():
    app = Flask(__name__)

    app.register_blueprint(files_bp)
    app.register_blueprint(kernel_bp)
    app.register_blueprint(home_bp)

    log_formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

    file_handler = logging.FileHandler("app.log")
    file_handler.setFormatter(log_formatter)
    file_handler.setLevel(logging.INFO)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(log_formatter)
    console_handler.setLevel(logging.INFO)

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    werkzeug_log = logging.getLogger("werkzeug")
    werkzeug_log.setLevel(logging.ERROR)
    WSGIRequestHandler.log_request = lambda *args, **kwargs: None

    @app.errorhandler(400)
    @app.errorhandler(401)
    @app.errorhandler(403)
    @app.errorhandler(404)
    @app.errorhandler(500)
    def handle_errors(error):
        return (
            render_template(
                "errors/error.html",
                error_code=error.code,
                error_message=error.name,
                error_description=error.description,
            ),
            error.code,
        )

    return app
