import os
import json
import tornado.web
from server.src.utils.file_utils import get_file_content
from server.src.utils.excluded_dirs import EXCLUDE_DIRS, FileTypeMappings
from .base_handler import BaseHandler


class HomeHandler(BaseHandler):
    def get(self):
        current_path = self.get_argument("path", default="")
        try:
            full_path = self._sanitize_path(current_path)
            if not os.path.isdir(full_path):
                raise tornado.web.HTTPError(400, "Invalid directory path")
            self.render(
                "home.html",
                title="HOME | Notebook X",
                current_path="Home/" + current_path,
            )
        except tornado.web.HTTPError as e:
            self.set_status(e.status_code)
            self.render("error.html", error_message=e.reason)


class NotebookHandler(BaseHandler):
    def get(self, path):
        """Serve and render a Jupyter notebook."""
        if not path:
            raise tornado.web.HTTPError(400, "No notebook path provided")

        try:
            full_path = self._sanitize_path(path)
            if not os.path.isfile(full_path) or not full_path.endswith(".ipynb"):
                raise tornado.web.HTTPError(404, "Notebook not found")

            with open(full_path, "r", encoding="utf-8") as f:
                notebook_content = json.load(f)

            self.render(
                "notebook.html",
                title=f"Notebook: {os.path.basename(path)}",
                notebook=notebook_content,
                current_path=os.path.dirname(path),
            )
        except json.JSONDecodeError:
            raise tornado.web.HTTPError(400, "Invalid notebook format")
        except tornado.web.HTTPError as e:
            self.set_status(e.status_code)
            self.render("error.html", error_message=e.reason)


class FileHandler(BaseHandler):
    def get(self, path):
        """Serve content for files or directory listing."""
        if not path:
            raise tornado.web.HTTPError(400, "No path provided")

        try:
            full_path = self._sanitize_path(path)
            if os.path.isdir(full_path):
                # Serve directory listing as JSON (for /files/ route)
                files = sorted(os.listdir(full_path))
                self.write({"type": "directory", "files": files})
            elif os.path.isfile(full_path):
                if full_path.endswith(".ipynb"):
                    self.redirect(f"/notebook/{path}")
                    return
                # Serve file content as HTML (for /open/ route)
                content = get_file_content(full_path)
                self.render(
                    "file.html",
                    title=f"{os.path.basename(path)}",
                    content=content,
                    current_path=os.path.dirname(path),
                )
            else:
                raise tornado.web.HTTPError(404, "File or directory not found")
        except tornado.web.HTTPError as e:
            self.set_status(e.status_code)
            if self.request.path.startswith("/open/"):
                self.render("error.html", error_message=e.reason)
            else:
                self.write({"error": e.reason})


class APIContentHandler(BaseHandler):
    def get(self):
        """Return file or notebook content via API."""
        path = self.request.headers.get("X-File-Path")
        if not path:
            raise tornado.web.HTTPError(400, "No path provided in headers")

        try:
            full_path = self._sanitize_path(path)

            if not os.path.isfile(full_path):
                raise tornado.web.HTTPError(404, "File not found")

            # Handle different file types
            if full_path.endswith(".ipynb"):
                with open(full_path, "r", encoding="utf-8") as f:
                    content = json.load(f)
                content_type = "notebook"
            else:
                content = get_file_content(full_path)
                content_type = "file"

            self.write(
                {
                    "type": content_type,
                    "content": content,
                    "filename": os.path.basename(path),
                }
            )
        except tornado.web.HTTPError as e:
            self.set_status(e.status_code)
            self.write({"error": e.reason})


class GetDirListingHandler(BaseHandler):
    def get(self):
        """Return directory listing."""
        path = self.get_argument("path", default="")
        try:
            full_path = self._sanitize_path(path)
            if not os.path.isdir(full_path):
                raise tornado.web.HTTPError(400, "Invalid directory path")

            files = sorted(os.listdir(full_path))
            directories = [
                f for f in files if os.path.isdir(os.path.join(full_path, f))
            ]
            files = [f for f in files if os.path.isfile(os.path.join(full_path, f))]

            self.write(
                {
                    "type": "directory",
                    "path": path,
                    "directories": directories,
                    "files": files,
                }
            )
        except tornado.web.HTTPError as e:
            self.set_status(e.status_code)
            self.write({"error": e.reason})


class APIFilesHandler(BaseHandler):
    def get(self):
        """Return the entire directory structure recursively as JSON."""
        root_path = self.get_argument("path", default="")
        try:
            full_path = self._sanitize_path(root_path)
            if not os.path.exists(full_path):
                raise tornado.web.HTTPError(400, "Path does not exist")
            if not os.path.isdir(full_path):
                raise tornado.web.HTTPError(400, "Path is not a directory")
            tree = self.build_tree(full_path)
            self.write(tree)
        except tornado.web.HTTPError as e:
            self.set_status(e.status_code)
            self.write({"error": e.reason})

    def build_tree(self, path):
        """Recursively build the directory tree with additional file metadata."""
        tree = {
            "name": os.path.basename(path) or "root",
            "type": "directory",
            "isDir": True,
            "children": [],
        }
        directories = []
        files = []

        try:
            for item in sorted(os.listdir(path)):
                item_path = os.path.join(path, item)

                if os.path.basename(item_path) in EXCLUDE_DIRS:
                    continue

                if os.path.isdir(item_path):
                    directories.append(self.build_tree(item_path))
                else:
                    file_info = {
                        "name": item,
                        "isDir": False,
                        "type": FileTypeMappings.get_type(item),
                        "size": os.path.getsize(item_path),
                        "lastModified": os.path.getmtime(item_path),
                    }
                    files.append(file_info)
        except PermissionError:
            files.append({"name": "Permission Denied", "isDir": False, "type": "error"})

        tree["children"] = directories + files
        return tree
