import tornado.web
import json
import traceback
import queue


class KernelHandler(tornado.web.RequestHandler):
    def initialize(self):
        self.kernel_manager = self.application.settings["kernel_manager"]
        self.kernel_registry = self.application.settings["kernel_registry"]

    def get(self):
        """Check for existing kernel, otherwise start a new one."""
        notebook_path = self.get_argument("notebook_path", None)
        if not notebook_path:
            self.set_status(400)
            self.write({"error": "Missing notebook_path"})
            return

        if notebook_path in self.kernel_registry:
            kernel_id = self.kernel_registry[notebook_path]
        else:
            kernel_id = self.kernel_manager.start_kernel()
            self.kernel_registry[notebook_path] = kernel_id

        self.write(
            {"kernel_id": kernel_id, "status": "running", "notebook": notebook_path}
        )

    def post(self):
        """Execute code on the specified kernel and return formatted outputs."""
        try:
            data = json.loads(self.request.body)
            kernel_id = data.get("kernel_id")
            code = data.get("code")

            if not kernel_id or not code:
                self.set_status(400)
                self.write({"error": "Missing kernel_id or code"})
                return

            km = self.kernel_manager.get_kernel_manager(kernel_id)
            if not km:
                self.set_status(404)
                self.write({"error": "Kernel not found"})
                return

            client = km.client()
            client.start_channels()

            try:
                msg_id = client.execute(code)
                reply = client.get_shell_msg(timeout=30)

                if reply["parent_header"]["msg_id"] != msg_id:
                    self.set_status(500)
                    self.write({"error": "Mismatched message ID"})
                    return

                status = reply["content"]["status"]
                execution_count = (
                    reply["content"]["execution_count"] if status == "ok" else None
                )

                outputs = []
                while True:
                    try:
                        msg = client.get_iopub_msg(timeout=0.1)
                        if msg["parent_header"].get("msg_id") != msg_id:
                            continue

                        msg_type = msg["msg_type"]
                        if (
                            msg_type == "status"
                            and msg["content"]["execution_state"] == "idle"
                        ):
                            break
                        elif msg_type in [
                            "execute_result",
                            "display_data",
                            "stream",
                            "error",
                        ]:
                            output = {"output_type": msg_type}
                            if msg_type in ["execute_result", "display_data"]:
                                output["data"] = msg["content"]["data"]
                                output["metadata"] = msg["content"]["metadata"]
                                if msg_type == "execute_result":
                                    output["execution_count"] = execution_count
                            elif msg_type == "stream":
                                output["name"] = msg["content"]["name"]
                                output["text"] = msg["content"]["text"]
                            elif msg_type == "error":
                                output["ename"] = msg["content"]["ename"]
                                output["evalue"] = msg["content"]["evalue"]
                                output["traceback"] = msg["content"]["traceback"]
                            outputs.append(output)
                    except queue.Empty:
                        continue

                self.write({"execution_count": execution_count, "outputs": outputs})

            finally:
                client.stop_channels()

        except Exception as e:
            self.set_status(500)
            self.write(
                {
                    "output_type": "error",
                    "ename": type(e).__name__,
                    "evalue": str(e),
                    "traceback": traceback.format_exception(
                        type(e), e, e.__traceback__
                    ),
                }
            )

    def delete(self):
        """Shut down the kernel and remove from registry."""
        notebook_path = self.get_argument("notebook_path", None)
        if not notebook_path or notebook_path not in self.kernel_registry:
            self.set_status(400)
            self.write({"error": "Invalid notebook_path"})
            return

        kernel_id = self.kernel_registry.pop(notebook_path)
        success = self.kernel_manager.shutdown_kernel(kernel_id)

        if success:
            self.write(
                {
                    "status": "Kernel shut down successfully",
                    "kernel_id": kernel_id,
                    "notebook_path": notebook_path,
                }
            )
        else:
            self.set_status(404)
            self.write({"error": "Kernel not found"})
