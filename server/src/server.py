import os
import tornado.ioloop
import tornado.web
from server.src.handlers.file_handler import (
    HomeHandler,
    FileHandler,
    APIFilesHandler,
    APIContentHandler,
    NotebookHandler,
    GetDirListingHandler,
)
from server.src.handlers.websocket_handler import WebSocketHandler
from server.src.handlers.kernel_handler import KernelHandler


def make_app():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    settings = {
        "template_path": os.path.join(base_dir, "../templates"),
        "static_path": os.path.join(base_dir, "../../frontend/dist"),
        "debug": True,
    }

    return tornado.web.Application(
        [
            (r"/", HomeHandler, dict(base_dir=base_dir)),
            (r"/notebook/(.*)", NotebookHandler, dict(base_dir=base_dir)),
            (r"/open/(.*)", FileHandler, dict(base_dir=base_dir)),
            (r"/files/(.*)", FileHandler, dict(base_dir=base_dir)),
            (r"/get-dir-listing", GetDirListingHandler, dict(base_dir=base_dir)),
            (r"/api/content", APIContentHandler, dict(base_dir=base_dir)),
            (r"/api/files", APIFilesHandler, dict(base_dir=base_dir)),
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
