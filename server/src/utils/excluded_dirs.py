import os

EXCLUDE_DIRS = {
    "node_modules",
    "venv",
    "__pycache__",
    ".git",
    ".idea",
    ".vscode",
    ".virtual_documents",
    ".ipynb_checkpoints",
    ".venv",
    "venv",
    "env",
    ".DS_Store",
}


class FileTypeMappings:
    """Centralized mapping of file types and their descriptions."""

    TYPES = {
        ".py": "Python Script",
        ".js": "JavaScript File",
        ".ts": "TypeScript File",
        ".java": "Java Source File",
        ".cpp": "C++ Source File",
        ".c": "C Source File",
        ".cs": "C# Source File",
        ".go": "Go Source File",
        ".rb": "Ruby Script",
        ".php": "PHP Script",
        ".sh": "Shell Script",
        ".bash": "Bash Script",
        ".html": "HTML Document",
        ".htm": "HTML Document",
        ".css": "CSS File",
        ".scss": "SCSS File",
        ".less": "LESS File",
        ".xml": "XML File",
        ".md": "Markdown Document",
        ".json": "JSON File",
        ".yaml": "YAML File",
        ".yml": "YAML File",
        ".toml": "TOML File",
        ".ini": "Configuration File",
        ".cfg": "Configuration File",
        ".csv": "CSV File",
        ".tsv": "TSV File",
        ".dockerfile": "Docker Configuration",
        "dockerfile": "Docker Configuration",
        "docker-compose.yml": "Docker Compose File",
        "docker-compose.yaml": "Docker Compose File",
        ".makefile": "Makefile",
        "makefile": "Makefile",
        ".cmake": "CMake File",
        ".pre-commit-config.yaml": "Pre-commit Config",
        ".gitignore": "Git Ignore File",
        ".gitattributes": "Git Attributes File",
        ".txt": "Text Document",
        ".log": "Log File",
        ".rst": "reStructuredText File",
        ".ipynb": "Jupyter Notebook",
        ".r": "R Script",
        ".sql": "SQL Script",
        ".bat": "Batch File",
        ".ps1": "PowerShell Script",
        ".env": "Environment File",
    }

    @staticmethod
    def get_type(filename):
        """Get file type based on filename/extension."""
        filename_lower = filename.lower()
        for key in FileTypeMappings.TYPES:
            if filename_lower == key.lower():
                return FileTypeMappings.TYPES[key]

        # Then check extensions
        ext = os.path.splitext(filename)[-1].lower()
        return FileTypeMappings.TYPES.get(ext, "-")
