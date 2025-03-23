document.addEventListener("DOMContentLoaded", function () {
  // Initial path is the current directory
  let currentPath = ".";
  loadFileList(currentPath);

  function loadFileList(path) {
    fetch(`/api/files/list?path=${encodeURIComponent(path)}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(`Error: ${data.error}`);
          return;
        }

        displayFiles(data.files);
        document.getElementById("current-path").textContent = path;
        currentPath = path;
      })
      .catch((error) => {
        console.error("Error fetching file list:", error);
        alert("Failed to load file list");
      });
  }

  function displayFiles(files) {
    const fileListElement = document.getElementById("file-list");
    fileListElement.innerHTML = "";
    fileListElement.className = "bg-gray-100 p-4 rounded-lg shadow-md";

    // Add parent directory option if not in root
    if (currentPath !== ".") {
      const parentItem = document.createElement("div");
      parentItem.textContent = "..";
      parentItem.className =
        "directory cursor-pointer text-blue-500 font-semibold hover:underline";
      parentItem.addEventListener("click", () => {
        const parentPath = currentPath.split("/").slice(0, -1).join("/") || ".";
        loadFileList(parentPath);
      });
      fileListElement.appendChild(parentItem);
    }

    // Sort files (directories first, then files)
    files.sort((a, b) => {
      if (a.type === "directory" && b.type !== "directory") return -1;
      if (a.type !== "directory" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name);
    });

    // Add files and directories to the list
    files.forEach((file) => {
      const fileItem = document.createElement("div");
      fileItem.textContent = file.name;
      fileItem.className =
        "p-2 rounded-lg my-1 transition-all duration-200 ease-in-out";

      if (file.type === "directory") {
        fileItem.classList.add(
          "cursor-pointer",
          "text-blue-600",
          "hover:bg-blue-100",
          "hover:text-blue-800",
          "font-semibold",
        );
        fileItem.addEventListener("click", () => {
          loadFileList(file.path);
        });
      } else {
        fileItem.classList.add(
          "cursor-pointer",
          "text-gray-800",
          "hover:bg-gray-200",
        );
        fileItem.addEventListener("click", () => {
          openFile(file);
        });
      }

      fileListElement.appendChild(fileItem);
    });
  }

  function openFile(file) {
    if (file.extension === ".ipynb" || file.extension === ".py") {
      window.location.href = `/notebook/${encodeURIComponent(file.path)}`;
    } else {
      alert("Only .ipynb and .py files are supported");
    }
  }
});
