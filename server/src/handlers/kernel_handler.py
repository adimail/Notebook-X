import tornado.web
from server.src.managers.kernel_manager import KernelManager
import json


class KernelHandler(tornado.web.RequestHandler):
    def initialize(self):
        self.kernel_manager = KernelManager()

    def get(self):
        """Return kernel status or start a new kernel."""
        kernel_id = self.kernel_manager.start_kernel()
        self.write({"kernel_id": kernel_id, "status": "running"})

    def post(self):
        """Execute code in the kernel."""
        data = json.loads(self.request.body)
        code = data.get("code")
        kernel_id = data.get("kernel_id")
        if not code:
            self.set_status(400)
            self.write({"error": "No code provided"})
            return
        if not kernel_id or kernel_id not in self.kernel_manager.kernels:
            self.set_status(400)
            self.write({"error": "Invalid or missing kernel_id"})
            return
        result = self.kernel_manager.execute_code(kernel_id, code)
        self.write(result)
