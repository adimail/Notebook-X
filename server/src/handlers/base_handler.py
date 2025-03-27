import os
import tornado


class BaseHandler(tornado.web.RequestHandler):
    def initialize(self, base_dir=None):
        self.base_dir = os.getcwd()

    def _sanitize_path(self, path):
        """Prevent directory traversal by ensuring path stays within base_dir."""
        full_path = os.path.abspath(os.path.join(self.base_dir, path))
        if not full_path.startswith(self.base_dir):
            raise tornado.web.HTTPError(
                403, "Access denied: Path outside base directory"
            )
        return full_path
