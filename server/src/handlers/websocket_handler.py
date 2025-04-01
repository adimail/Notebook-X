import tornado.websocket
from server.logger import logger
import json
import queue
import traceback


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        logger.info(f"WebSocket connection opened: {self.request.remote_ip}")

    def on_message(self, message):
        """Handle incoming message and send back execution results."""
        try:
            message_data = json.loads(message)
            if message_data["type"] == "execute_code":
                kernel_id = message_data["kernel_id"]
                code = message_data["code"]
                request_id = message_data.get("requestId", "default")
                logger.info(
                    f"Executing code on kernel {kernel_id} | Request ID: {request_id}"
                )
                self.execute_code(kernel_id, code, request_id)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {message}")
            self.write_message(json.dumps({"error": "Invalid JSON"}))
        except Exception as e:
            logger.exception("Error processing message")
            self.write_message(json.dumps({"error": str(e)}))

    def on_close(self):
        logger.info(f"WebSocket connection closed: {self.request.remote_ip}")

    def check_origin(self, origin):
        """Allow connections from any origin in debug mode."""
        return True

    def execute_code(self, kernel_id, code, request_id="default"):
        """Execute the code and send results back to the frontend."""
        try:
            km = self.application.settings["kernel_manager"].get_kernel_manager(
                kernel_id
            )
            if not km:
                logger.warning(f"Kernel {kernel_id} not found")
                self.write_message(
                    json.dumps({"error": "Kernel not found", "requestId": request_id})
                )
                return

            client = km.client()
            client.start_channels()
            msg_id = client.execute(code)

            reply = client.get_shell_msg(timeout=30)
            if reply["parent_header"]["msg_id"] != msg_id:
                logger.warning(f"Message ID mismatch for request {request_id}")
                self.write_message(
                    json.dumps(
                        {"error": "Mismatched message ID", "requestId": request_id}
                    )
                )
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

            logger.info(f"Execution completed | Kernel: {kernel_id}, Status: {status}")

            self.write_message(
                json.dumps(
                    {
                        "execution_count": execution_count,
                        "outputs": outputs,
                        "requestId": request_id,
                    }
                )
            )
        except Exception as e:
            logger.exception(
                f"Error during execution | Kernel: {kernel_id}, Request ID: {request_id}"
            )
            self.write_message(
                json.dumps(
                    {
                        "error": {
                            "ename": type(e).__name__,
                            "evalue": str(e),
                            "traceback": traceback.format_exception(
                                type(e), e, e.__traceback__
                            ),
                        }
                    }
                )
            )
