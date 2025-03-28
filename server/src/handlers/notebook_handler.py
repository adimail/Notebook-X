import os
import tornado.web
import nbformat
from nbformat.v4 import new_notebook, new_code_cell, new_markdown_cell
from .base_handler import BaseHandler
from datetime import datetime


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
                notebook = nbformat.read(f, as_version=4)

            checkpoint_dir = os.path.join(
                os.path.dirname(full_path), ".ipynb_checkpoints"
            )
            last_checkpoint = self._get_last_checkpoint(checkpoint_dir)

            self.render(
                "notebook.html",
                title=os.path.basename(path),
                cells=notebook.cells,
                current_path=os.path.dirname(path),
                kernelspec=notebook.metadata.get("kernelspec", {}),
                language_info=notebook.metadata.get("language_info", {}),
                nbformat=notebook.nbformat,
                nbformat_minor=notebook.nbformat_minor,
                last_checkpoint=last_checkpoint,
                metadata=notebook.metadata,
            )
        except Exception as e:
            raise tornado.web.HTTPError(400, str(e))

    def post(self, path):
        """Create a new Jupyter notebook."""
        try:
            full_path = self._sanitize_path(path)
            if os.path.exists(full_path):
                raise tornado.web.HTTPError(400, "Notebook already exists")

            notebook = new_notebook()
            with open(full_path, "w", encoding="utf-8") as f:
                nbformat.write(notebook, f)

            self.write({"message": "Notebook created", "path": full_path})
        except Exception as e:
            raise tornado.web.HTTPError(400, str(e))

    def put(self, path):
        """Update an existing Jupyter notebook."""
        try:
            full_path = self._sanitize_path(path)
            if not os.path.isfile(full_path):
                raise tornado.web.HTTPError(404, "Notebook not found")

            data = tornado.escape.json_decode(self.request.body)
            notebook = nbformat.from_dict(data)

            with open(full_path, "w", encoding="utf-8") as f:
                nbformat.write(notebook, f)

            self.write({"message": "Notebook updated", "path": full_path})
        except Exception as e:
            raise tornado.web.HTTPError(400, str(e))

    def delete(self, path):
        """Delete a Jupyter notebook."""
        try:
            full_path = self._sanitize_path(path)
            if not os.path.isfile(full_path):
                raise tornado.web.HTTPError(404, "Notebook not found")

            os.remove(full_path)
            self.write({"message": "Notebook deleted", "path": full_path})
        except Exception as e:
            raise tornado.web.HTTPError(400, str(e))

    def _get_last_checkpoint(self, checkpoint_dir):
        """Get the most recent notebook checkpoint."""
        if os.path.exists(checkpoint_dir):
            checkpoints = [
                f for f in os.listdir(checkpoint_dir) if f.endswith(".ipynb")
            ]
            if checkpoints:
                checkpoints.sort(
                    key=lambda x: os.path.getmtime(os.path.join(checkpoint_dir, x)),
                    reverse=True,
                )
                return {
                    "filename": checkpoints[0],
                    "path": os.path.join(checkpoint_dir, checkpoints[0]),
                    "modified": datetime.fromtimestamp(
                        os.path.getmtime(os.path.join(checkpoint_dir, checkpoints[0]))
                    ).isoformat(),
                }
        return None
