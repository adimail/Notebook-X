import os
import tornado.web
from server.src.utils.file_utils import get_file_content


class HomeHandler(tornado.web.RequestHandler):
    def get(self):
        current_path = self.get_argument("path", default="")
        self.render("home.html", title="HOME | Notebook X", current_path=current_path)


class FileHandler(tornado.web.RequestHandler):
    def get(self, path):
        """Serve file content or directory listing."""
        if not path:
            self.set_status(400)
            self.write({"error": "No file path provided"})
            return

        full_path = os.path.join(os.getcwd(), path)
        if os.path.isdir(full_path):
            files = os.listdir(full_path)
            self.write({"type": "directory", "files": files})
        elif os.path.isfile(full_path):
            content = get_file_content(full_path)
            self.write({"type": "file", "content": content})
        else:
            self.set_status(404)
            self.write({"error": "File or directory not found"})


class APIFilesHandler(tornado.web.RequestHandler):
    def get(self):
        """Return the entire directory structure recursively."""
        root_path = self.get_argument("path", default=os.getcwd())
        if not os.path.isdir(root_path):
            self.set_status(400)
            self.write({"error": "Invalid path"})
            return
        tree = self.build_tree(root_path)
        self.write(tree)

    def build_tree(self, path):
        """Recursively build the directory tree."""
        tree = {"name": os.path.basename(path) or "root", "isDir": True, "children": []}
        try:
            for item in os.listdir(path):
                item_path = os.path.join(path, item)
                if os.path.isdir(item_path):
                    subtree = self.build_tree(item_path)
                    tree["children"].append(subtree)
                else:
                    tree["children"].append({"name": item, "isDir": False})
        except PermissionError:
            pass
        return tree
