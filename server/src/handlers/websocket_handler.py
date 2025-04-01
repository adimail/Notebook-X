import tornado.websocket
import json
import queue


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket connection opened")

    def on_message(self, message):
        """Handle incoming message and send back execution results."""
        try:
            message_data = json.loads(message)
            if message_data["type"] == "execute_code":
                kernel_id = message_data["kernel_id"]
                code = message_data["code"]
                request_id = message_data.get("requestId", "default")
                self.execute_code(kernel_id, code, request_id)
        except Exception as e:
            self.write_message(json.dumps({"error": str(e)}))

    def on_close(self):
        print("WebSocket connection closed")

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
                self.write_message(
                    json.dumps({"error": "Kernel not found", "requestId": request_id})
                )
                return

            client = km.client()
            client.start_channels()
            msg_id = client.execute(code)

            reply = client.get_shell_msg(timeout=30)
            if reply["parent_header"]["msg_id"] != msg_id:
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
            self.write_message(json.dumps({"error": str(e), "requestId": request_id}))
