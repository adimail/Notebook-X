import tornado.websocket


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket connection opened")

    def on_message(self, message):
        """Echo back the message or handle custom logic."""
        self.write_message(f"Received: {message}")

    def on_close(self):
        print("WebSocket connection closed")

    def check_origin(self, origin):
        """Allow connections from any origin in debug mode."""
        return True
