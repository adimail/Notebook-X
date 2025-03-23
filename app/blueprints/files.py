from flask import Blueprint, jsonify, request, current_app
import os
import json

files_bp = Blueprint("files", __name__, url_prefix="/api/files")


@files_bp.route("/list", methods=["GET"])
def list_files():
    """List all files in the current directory."""
    path = request.args.get("path", ".")
    try:
        files = []
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            item_type = "directory" if os.path.isdir(item_path) else "file"
            extension = os.path.splitext(item)[1] if item_type == "file" else ""
            files.append(
                {
                    "name": item,
                    "path": item_path,
                    "type": item_type,
                    "extension": extension,
                }
            )
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@files_bp.route("/content", methods=["GET"])
def get_file_content():
    """Get the content of a file."""
    path = request.args.get("path")
    if not path:
        return jsonify({"error": "No path provided"}), 400

    try:
        if path.endswith(".ipynb"):
            with open(path, "r") as f:
                content = json.load(f)
            return jsonify({"content": content, "type": "notebook"})
        else:
            with open(path, "r") as f:
                content = f.read()
            return jsonify({"content": content, "type": "file"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@files_bp.route("/save", methods=["POST"])
def save_file():
    """Save content to a file."""
    data = request.get_json()
    path = data.get("path")
    content = data.get("content")

    if not path or content is None:
        return jsonify({"error": "Path or content not provided"}), 400

    try:
        if path.endswith(".ipynb"):
            with open(path, "w") as f:
                json.dump(content, f, indent=2)
        else:
            with open(path, "w") as f:
                f.write(content)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
