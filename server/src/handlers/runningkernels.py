import tornado.web
from .base_handler import BaseHandler
import os


class RunningKernelsHandler(BaseHandler):
    def get(self):
        """Handle requests to display running kernels and their associated notebooks."""
        try:
            kernel_registry = self.settings.get("kernel_registry", {})

            running_kernels = [
                {
                    "kernel_id": kernel_id,
                    "notebook_name": os.path.basename(notebook_path),
                }
                for notebook_path, kernel_id in kernel_registry.items()
            ]

            if self.request.path.startswith("/api"):
                self.write({"running_kernels": running_kernels})
            else:
                self.render(
                    "running.html",
                    running_kernels=running_kernels,
                    title="Running Kernels",
                )

        except Exception as e:
            self.set_status(500)
            if self.request.path.startswith("/api"):
                self.write({"error": f"Failed to fetch running kernels: {str(e)}"})
            else:
                self.render(
                    "error.html",
                    status_code=500,
                    title="Internal Server Error",
                    error=str(e),
                )
