import sys
import platform
import pkg_resources
import tornado.web
from .base_handler import BaseHandler


class PackagesHandler(BaseHandler):
    def get(self, format=None):
        """Handle both API and HTML requests for package information."""
        try:
            python_version = f"Python {platform.python_version()}"
            pip_version = f"pip {pkg_resources.get_distribution('pip').version}"
            packages = [
                {"name": dist.key, "version": dist.version}
                for dist in pkg_resources.working_set
            ]
            packages.sort(key=lambda x: x["name"].lower())

            if self.request.path.startswith("/api"):
                response = {
                    "python_version": python_version,
                    "pip_version": pip_version,
                    "packages": packages,
                }
                self.write(response)
            else:
                self.render(
                    "packages.html",
                    python_version=python_version,
                    pip_version=pip_version,
                    packages=packages,
                    title="Python packages",
                )

        except Exception as e:
            self.set_status(500)
            if self.request.path.startswith("/api"):
                self.write({"error": f"Failed to fetch package info: {str(e)}"})
            else:
                self.render(
                    "error.html",
                    status_code=500,
                    title="Internal Server Error",
                    error=e,
                )
