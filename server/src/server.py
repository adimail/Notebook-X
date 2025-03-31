import os
import tornado.ioloop
import tornado.web
from server.src.handlers.file_handler import (
    HomeHandler,
    FileHandler,
    APIFilesHandler,
    APIDeleteFilesHandler,
    APISaveFileHandler,
    APISaveNotebookHandler,
)
from server.src.handlers.websocket_handler import WebSocketHandler
from server.src.handlers.notebook_handler import (
    NotebookHandler,
    CreateNotebookHandler,
    LoadNotebookHandler,
)
from server.src.handlers.kernel_handler import KernelHandler
from server.src.handlers.packages_handler import PackagesHandler
from server.src.managers.kernel_manager import KernelManager


class NotFoundHandler(tornado.web.RequestHandler):
    """Custom handler for 404 errors that renders error.html."""

    def prepare(self):
        self.set_status(404)
        self.render(
            "error.html",
            title="Page Not Found",
            status_code=404,
            error="The page you are looking for does not exist.",
        )


def make_app():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    settings = {
        "template_path": os.path.join(base_dir, "../templates"),
        "static_path": os.path.join(base_dir, "../../frontend/dist"),
        "debug": True,
        "kernel_manager": KernelManager(),
        "kernel_registry": {},
    }

    return tornado.web.Application(
        [
            (r"/", HomeHandler, dict(base_dir=base_dir)),
            (r"/notebook/(.*)", NotebookHandler, dict(base_dir=base_dir)),
            (r"/open/(.*)", FileHandler, dict(base_dir=base_dir)),
            (r"/api/files", APIFilesHandler, dict(base_dir=base_dir)),
            (r"/api/packages", PackagesHandler),
            (r"/packages", PackagesHandler),
            (r"/ws", WebSocketHandler),
            (r"/api/kernel", KernelHandler),
            (r"/api/notebook/create", CreateNotebookHandler),
            (r"/api/load_notebook", LoadNotebookHandler),
            (r"/api/delete_files", APIDeleteFilesHandler, dict(base_dir=base_dir)),
            (r"/api/save_file", APISaveFileHandler, dict(base_dir=base_dir)),
            (r"/api/save-notebook", APISaveNotebookHandler),
            (
                r"/static/(.*)",
                tornado.web.StaticFileHandler,
                {"path": settings["static_path"]},
            ),
        ],
        default_handler_class=NotFoundHandler,
        **settings,
    )
