import os


def get_file_content(file_path):
    """Read and return file content."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"


def build_tree(path):
    tree = []
    for entry in os.listdir(path):
        full_path = os.path.join(path, entry)
        item = {"name": entry, "isDir": os.path.isdir(full_path)}
        if item["isDir"]:
            item["children"] = build_tree(full_path)
        tree.append(item)
    return sorted(tree, key=lambda x: (not x["isDir"], x["name"].lower()))
