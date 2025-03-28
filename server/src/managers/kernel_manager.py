import subprocess
import json
import uuid
import zmq
import threading
import logging
import os

LOG_FILE = "notebookx.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(LOG_FILE, mode="w"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class KernelManager:
    def __init__(self):
        self.kernels = {}
        self.context = zmq.Context()

    def start_kernel(self):
        kernel_id = str(uuid.uuid4())
        connection_file = f"kernel-{kernel_id}.json"
        try:
            process = subprocess.Popen(
                ["python", "-m", "ipykernel_launcher", "-f", connection_file],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            logger.info(f"kernel process started with PID : {process.pid}")
            with open(connection_file, "r") as f:
                connection_info = json.load(f)
            os.remove(connection_file)
            self.kernels[kernel_id] = {
                "process": process,
                "connection_info": connection_info,
            }
            return kernel_id
        except Exception as e:
            logger.error(f"Error starting kernel: {e}")
            return None

    def execute_code(self, kernel_id, code):
        if kernel_id not in self.kernels:
            return {"error": "Kernel not found"}
        connection_info = self.kernels[kernel_id]["connection_info"]
        control_address = (
            f"tcp://{connection_info['ip']}:{connection_info['control_port']}"
        )
        shell_address = f"tcp://{connection_info['ip']}:{connection_info['shell_port']}"
        try:
            shell_socket = self.context.socket(zmq.REQ)
            shell_socket.connect(shell_address)
            control_socket = self.context.socket(zmq.REQ)
            control_socket.connect(control_address)
            # Create a message to execute the code
            msg = {
                "header": {
                    "msg_id": str(uuid.uuid4()),
                    "username": "kernel",
                    "session": str(uuid.uuid4()),
                    "msg_type": "execute_request",
                    "version": "5.3",
                },
                "parent_header": {},
                "metadata": {},
                "content": {
                    "code": code,
                    "silent": False,
                    "store_history": True,
                    "user_expressions": {},
                    "allow_stdin": False,
                    "stop_on_error": True,
                },
                "buffers": [],
                "channel": "shell",
            }
            shell_socket.send_json(msg)
            reply = shell_socket.recv_json()
            shell_socket.close()
            return reply
        except Exception as e:
            logger.error(f"Error executing code: {e}")
            return {"error": str(e)}
