import os
import json
import nbformat
from nbformat import NotebookNode
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
            self.render(
                "error.html",
                status_code=e.status_code,
                title="An unknown error occured",
                error=e,
            )


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
                self.render(
                    "error.html",
                    status_code=e.status_code,
                    title="An unknown error occured",
                    error=e,
                )
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


class APISaveFileHandler(BaseHandler):
    def post(self):
        """Handle saving file content."""
        try:
            data = json.loads(self.request.body.decode("utf-8"))
            file_path = data.get("path")
            content = data.get("content")

            if not file_path or not content:
                raise tornado.web.HTTPError(400, "File path and content are required")

            full_path = self._sanitize_path(file_path)

            if not os.path.exists(full_path) or not os.path.isfile(full_path):
                raise tornado.web.HTTPError(404, "File not found")

            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)

            self.write({"status": "success", "message": "File saved successfully"})

        except tornado.web.HTTPError as e:
            self.set_status(e.status_code)
            self.write({"error": e.reason})

        except Exception as e:
            self.set_status(500)
            self.write({"error": str(e)})


class APIDeleteFilesHandler(BaseHandler):
    def delete(self):
        try:
            data = json.loads(self.request.body.decode("utf-8"))
            files = data.get("files", [])
            if not files:
                raise tornado.web.HTTPError(400, "No files specified")

            deleted_files = []
            for file_rel_path in files:
                file_path = self._sanitize_path(file_rel_path)

                if any(
                    excluded in file_path.split(os.sep) for excluded in EXCLUDE_DIRS
                ):
                    self.write({"error": f"Deletion not allowed: {file_rel_path}"})
                    return

                if os.path.exists(file_path) and os.path.isfile(file_path):
                    os.remove(file_path)
                    deleted_files.append(file_rel_path)
                else:
                    self.write(
                        {"error": f"File {file_rel_path} not found or not a file"}
                    )
                    return

            self.write({"status": "success", "deleted": deleted_files})

        except Exception as e:
            self.set_status(500)
            self.write({"error": str(e)})


class APISaveNotebookHandler(BaseHandler):
    def post(self):
        """Handle saving a notebook to the file system with validation."""
        try:
            data = json.loads(self.request.body.decode("utf-8"))
            notebook_content = data.get("notebook")
            file_path = data.get("path")

            if not notebook_content or not file_path:
                self.set_status(400)
                self.write({"error": "Notebook data and path are required"})
                return

            try:
                if isinstance(notebook_content, dict):
                    nb = nbformat.from_dict(notebook_content)
                else:
                    nb = nbformat.reads(json.dumps(notebook_content), as_version=4)

                nbformat.validate(nb)

            except nbformat.ValidationError as ve:
                self.set_status(400)
                self.write({"error": f"Invalid notebook format: {str(ve)}"})
                return
            except Exception as ve:
                self.set_status(400)
                self.write({"error": f"Failed to parse notebook: {str(ve)}"})
                return

            full_path = self._sanitize_path(file_path)

            if not full_path.endswith(".ipynb"):
                full_path += ".ipynb"

            os.makedirs(os.path.dirname(full_path), exist_ok=True)

            with open(full_path, "w", encoding="utf-8") as f:
                nbformat.write(nb, f)

            self.write({"status": "success", "message": "Notebook saved successfully"})

        except tornado.web.HTTPError as e:
            self.set_status(e.status_code)
            self.write({"error": e.reason})

        except Exception as e:
            self.set_status(500)
            self.write({"error": str(e)})
