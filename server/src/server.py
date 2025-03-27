import os
import tornado.ioloop
import tornado.web
from server.src.handlers.file_handler import HomeHandler, FileHandler, APIFilesHandler
from server.src.handlers.websocket_handler import WebSocketHandler
from server.src.handlers.kernel_handler import KernelHandler


def make_app():
    base_dir = os.path.dirname(__file__)
    settings = {
        "template_path": "server/templates",
        "static_path": os.path.join(base_dir, "../../frontend/dist"),
        "debug": True,
    }

    return tornado.web.Application(
        [
            (r"/", HomeHandler),
            (r"/files/(.*)", FileHandler),
            (r"/api/files", APIFilesHandler),
            (r"/ws", WebSocketHandler),
            (r"/kernel", KernelHandler),
            (
                r"/static/(.*)",
                tornado.web.StaticFileHandler,
                {"path": settings["static_path"]},
            ),
            (r".*", tornado.web.ErrorHandler, {"status_code": 404}),
        ],
        **settings
    )
