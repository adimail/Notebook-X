import os
import json
import tornado.web
from server.src.utils.file_utils import get_file_content
from server.src.utils.excluded_dirs import EXCLUDE_DIRS, FileTypeMappings
from .base_handler import BaseHandler
from datetime import datetime


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
                current_path="Home" if current_path == "" else current_path,
            )
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


class APIFilesHandler(BaseHandler):
    def get(self):
        """Return files and directories in the current directory as JSON."""
        root_path = self.get_argument("path", default="")
        try:
            full_path = self._sanitize_path(root_path)
            if not os.path.exists(full_path):
                raise tornado.web.HTTPError(400, "Path does not exist")
            if not os.path.isdir(full_path):
                raise tornado.web.HTTPError(400, "Path is not a directory")
            file_list = self.list_files_and_dirs(full_path)
            self.write(file_list)
        except tornado.web.HTTPError as e:
            self.set_status(e.status_code)
            self.write({"error": e.reason})

    def list_files_and_dirs(self, path):
        """List files and directories in the current directory in a specific order."""
        directories = []
        ipynb_files = []
        other_files = []

        try:
            for item in sorted(os.listdir(path)):
                item_path = os.path.join(path, item)

                if os.path.basename(item_path) in EXCLUDE_DIRS:
                    continue

                entry_info = {
                    "name": item,
                    "isDir": os.path.isdir(item_path),
                    "type": (
                        "directory"
                        if os.path.isdir(item_path)
                        else FileTypeMappings.get_type(item)
                    ),
                    "size": (
                        os.path.getsize(item_path)
                        if os.path.isfile(item_path)
                        else None
                    ),
                    "lastModified": os.path.getmtime(item_path),
                }

                if entry_info["isDir"]:
                    directories.append(entry_info)
                elif item.endswith(".ipynb"):
                    ipynb_files.append(entry_info)
                else:
                    other_files.append(entry_info)

        except PermissionError:
            return {
                "name": os.path.basename(path) or "root",
                "type": "directory",
                "isDir": True,
                "children": [
                    {"name": "Permission Denied", "isDir": False, "type": "error"}
                ],
            }

        return {
            "name": os.path.basename(path) or "root",
            "type": "directory",
            "isDir": True,
            "children": directories + ipynb_files + other_files,
        }
