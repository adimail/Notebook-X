import tornado.web
from server.src.managers.kernel_manager import KernelManager
import json
import base64
import traceback


class KernelHandler(tornado.web.RequestHandler):
    def initialize(self):
        self.kernel_manager = KernelManager()

    def get(self):
        """Return kernel status or start a new kernel."""
        kernel_id = self.kernel_manager.start_kernel()
        self.write({"kernel_id": kernel_id, "status": "running"})

    def post(self):
        """Execute code in the kernel and return formatted output."""
        try:
            data = json.loads(self.request.body)
            code = data.get("code")
            kernel_id = data.get("kernel_id", "default-kernel")

            if not code:
                self.set_status(400)
                self.write({"error": "No code provided"})
                return

            # Simulating different output types
            if code.strip() == "print('Hello')":
                response = {
                    "kernel_id": kernel_id,
                    "output_type": "stream",
                    "name": "stdout",
                    "text": ["Hello\n"],
                }
            elif code.strip() == "df":
                response = {
                    "kernel_id": kernel_id,
                    "output_type": "display_data",
                    "data": {
                        "text/html": """
                        <div class="output-html">
                            <div>
                                <table class="dataframe" border="1">
                                    <thead>
                                        <tr style="text-align: right;">
                                            <th>Column 1</th>
                                            <th>Column 2</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td>A</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>B</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p>2 rows × 2 columns</p>
                            </div>
                        </div>
                        """
                    },
                    "metadata": {},
                }
            elif code.strip() == "42":
                response = {
                    "kernel_id": kernel_id,
                    "output_type": "execute_result",
                    "execution_count": 1,
                    "data": {"text/plain": "42"},
                }
            elif code.strip() == "1/0":
                response = {
                    "kernel_id": kernel_id,
                    "output_type": "error",
                    "ename": "ZeroDivisionError",
                    "evalue": "division by zero",
                    "traceback": traceback.format_exception_only(
                        ZeroDivisionError, ZeroDivisionError("division by zero")
                    ),
                }
            elif code.strip() == "plot":
                # Simulated base64 image response
                fake_image_data = base64.b64encode(b"fake-image-bytes").decode()
                response = {
                    "kernel_id": kernel_id,
                    "output_type": "display_data",
                    "data": {"image/png": fake_image_data},
                    "metadata": {},
                }
            elif code.strip() == "json":
                response = {
                    "kernel_id": kernel_id,
                    "output_type": "display_data",
                    "data": {"application/json": {"message": "Hello, JSON!"}},
                    "metadata": {},
                }
            else:
                response = {
                    "kernel_id": kernel_id,
                    "output_type": "stream",
                    "name": "stdout",
                    "text": [f"Executed: {code}\n"],
                }

            self.write(response)

        except Exception as e:
            self.set_status(500)
            self.write(
                {
                    "output_type": "error",
                    "ename": type(e).__name__,
                    "evalue": str(e),
                    "traceback": traceback.format_exception_only(type(e), e),
                }
            )
