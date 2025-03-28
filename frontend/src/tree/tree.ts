import { DirectoryItem } from "@/types";

export function getQueryParam(param: string): string {
  const params = new URLSearchParams(window.location.search);
  return params.get(param) || "";
}

export function renderDirectoryListing(
  items: DirectoryItem[],
  currentPath: string,
) {
  const container = document.getElementById("directory-container");
  if (!container) return;
  container.innerHTML = "";
  container.className = "directory-listing";

  if (currentPath) {
    const upLink = document.createElement("a");
    const pathParts = currentPath.split("/").filter(Boolean);
    pathParts.pop();
    const upPath = pathParts.join("/");
    upLink.href = `/?path=${encodeURIComponent(upPath)}`;
    upLink.textContent = ".. (up)";
    upLink.className = "up-link";
    container.appendChild(upLink);
    container.appendChild(document.createElement("br"));
  }

  const table = document.createElement("table");
  table.className = "directory-table";

  const headerRow = document.createElement("tr");

  const selectAllTh = document.createElement("th");
  const selectAllCheckbox = document.createElement("input");
  selectAllCheckbox.type = "checkbox";
  selectAllCheckbox.addEventListener("change", () => {
    checkboxes.forEach((cb) => (cb.checked = selectAllCheckbox.checked));
    updateDeleteButtonState();
  });
  selectAllTh.appendChild(selectAllCheckbox);
  headerRow.appendChild(selectAllTh);

  ["Name", "Type", "Size (KB)", "Last Modified"].forEach((title) => {
    const th = document.createElement("th");
    th.textContent = title;
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  const checkboxes: HTMLInputElement[] = [];

  items.forEach((item) => {
    const row = document.createElement("tr");

    const checkboxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.filepath = currentPath
      ? `${currentPath}/${item.name}`
      : item.name;
    checkbox.addEventListener("change", updateDeleteButtonState);
    checkboxes.push(checkbox);
    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);

    const nameCell = document.createElement("td");
    const itemLink = document.createElement("a");

    if (item.isDir) {
      const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      itemLink.href = `/?path=${encodeURIComponent(newPath)}`;
      itemLink.textContent = `[DIR] ${item.name}`;
      itemLink.className = "dir-link";
    } else {
      const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
      itemLink.href = `/open/${encodeURIComponent(filePath)}`;
      itemLink.textContent = item.name;

      if (item.name.endsWith(".ipynb")) {
        itemLink.className = "notebook-link";
      } else {
        itemLink.className = "file-link";
      }
    }

    nameCell.appendChild(itemLink);
    row.appendChild(nameCell);

    const typeCell = document.createElement("td");
    typeCell.textContent = item.type || "unknown";
    row.appendChild(typeCell);

    const sizeCell = document.createElement("td");
    sizeCell.textContent = item.size ? (item.size / 1024).toFixed(2) : "-";
    row.appendChild(sizeCell);

    const dateCell = document.createElement("td");
    const lastModified = item.lastModified
      ? new Date(item.lastModified * 1000).toLocaleString()
      : "-";
    dateCell.textContent = lastModified;
    row.appendChild(dateCell);

    table.appendChild(row);
  });

  container.appendChild(table);
}

function updateDeleteButtonState() {
  const deleteButton = document.getElementById(
    "delete-button",
  ) as HTMLButtonElement;
  const selectedFiles = document.querySelectorAll(
    'input[type="checkbox"]:checked',
  );
  deleteButton.disabled = selectedFiles.length === 0;
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentPath = getQueryParam("path");

  try {
    const response = await fetch(
      `/api/files?path=${encodeURIComponent(currentPath)}`,
    );
    const directoryData = await response.json();
    renderDirectoryListing(directoryData.children, currentPath);
  } catch (error) {
    console.error("Error loading directory:", error);
  }

  const deleteButton = document.getElementById(
    "delete-button",
  ) as HTMLButtonElement;
  if (!deleteButton) return;
  deleteButton.addEventListener("click", async () => {
    const selectedFiles = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"]:checked',
      ),
    ).map((cb) => cb.dataset.filepath as string);

    if (selectedFiles.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedFiles.length} files?`,
    );
    if (!confirmed) return;

    try {
      const response = await fetch("/api/delete_files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: selectedFiles }),
      });

      if (!response.ok) throw new Error("Failed to delete files");

      location.reload();
    } catch (error) {
      console.error("Error deleting files:", error);
      alert("Error deleting files");
    }
  });
});
