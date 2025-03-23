from flask import Blueprint, jsonify, request
import json
import sys
import io
from IPython.core.interactiveshell import InteractiveShell

kernel_bp = Blueprint("kernel", __name__, url_prefix="/api/kernel")

# Store for active kernels
kernels = {}


class IPythonKernel:
    def __init__(self, kernel_id):
        self.kernel_id = kernel_id
        self.shell = InteractiveShell.instance()
        self.stdout_capture = io.StringIO()
        self.stderr_capture = io.StringIO()
        self.execution_count = 0

    def execute(self, code):
        """Execute code and return the result."""
        self.execution_count += 1

        # Capture stdout and stderr
        original_stdout = sys.stdout
        original_stderr = sys.stderr
        sys.stdout = self.stdout_capture
        sys.stderr = self.stderr_capture

        try:
            result = self.shell.run_cell(code)
            output = {
                "execution_count": self.execution_count,
                "status": "ok" if result.success else "error",
                "stdout": self.stdout_capture.getvalue(),
                "stderr": self.stderr_capture.getvalue(),
            }

            # Add result data if available
            if result.result is not None:
                output["data"] = repr(result.result)

            # Add error info if there was an error
            if not result.success and result.error_in_exec is not None:
                output["ename"] = type(result.error_in_exec).__name__
                output["evalue"] = str(result.error_in_exec)

            return output
        finally:
            # Restore stdout and stderr
            sys.stdout = original_stdout
            sys.stderr = original_stderr
            # Clear the capture buffers
            self.stdout_capture = io.StringIO()
            self.stderr_capture = io.StringIO()


@kernel_bp.route("/create", methods=["POST"])
def create_kernel():
    """Create a new IPython kernel."""
    kernel_id = str(len(kernels) + 1)
    kernels[kernel_id] = IPythonKernel(kernel_id)
    return jsonify({"kernel_id": kernel_id})


@kernel_bp.route("/execute", methods=["POST"])
def execute_code():
    """Execute code in the specified kernel."""
    data = request.get_json()
    kernel_id = data.get("kernel_id")
    code = data.get("code")
    cell_id = data.get("cell_id", None)

    if not kernel_id or code is None:
        return jsonify({"error": "Kernel ID or code not provided"}), 400

    if kernel_id not in kernels:
        return jsonify({"error": "Kernel not found"}), 404

    try:
        result = kernels[kernel_id].execute(code)
        if cell_id is not None:
            result["cell_id"] = cell_id
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
