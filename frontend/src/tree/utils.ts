import { DirectoryItem } from "@/types";

export function getQueryParam(param: string): string {
  return new URLSearchParams(window.location.search).get(param) || "";
}

export function renderDirectoryListing(
  items: DirectoryItem[],
  currentPath: string,
) {
  const container = document.getElementById("directory-container");
  if (!container) return;

  container.innerHTML = "";
  container.className = "directory-listing";

  const fragment = document.createDocumentFragment();

  if (currentPath) {
    const upLink = document.createElement("a");
    upLink.href = `/?path=${encodeURIComponent(currentPath.split("/").slice(0, -1).join("/"))}`;
    upLink.textContent = ".. (up)";
    upLink.className = "up-link";
    fragment.appendChild(upLink);
    fragment.appendChild(document.createElement("br"));
  }

  const table = document.createElement("table");
  table.className = "directory-table";
  table.appendChild(createTableHeader());

  items.forEach((item) => table.appendChild(createTableRow(item, currentPath)));

  fragment.appendChild(table);
  container.appendChild(fragment);
}

function createTableHeader(): HTMLTableRowElement {
  const headerRow = document.createElement("tr");

  const selectAllTh = document.createElement("th");
  const selectAllCheckbox = document.createElement("input");
  selectAllCheckbox.type = "checkbox";
  selectAllCheckbox.addEventListener("change", () => {
    document
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((cb) => {
        cb.checked = selectAllCheckbox.checked;
      });
    updateDeleteButtonState();
  });

  selectAllTh.appendChild(selectAllCheckbox);
  headerRow.appendChild(selectAllTh);

  ["Name", "Type", "Size (KB)", "Last Modified"].forEach((title) => {
    const th = document.createElement("th");
    th.textContent = title;
    headerRow.appendChild(th);
  });

  return headerRow;
}

function createTableRow(
  item: DirectoryItem,
  currentPath: string,
): HTMLTableRowElement {
  const row = document.createElement("tr");

  const checkboxCell = document.createElement("td");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.dataset.filepath = currentPath
    ? `${currentPath}/${item.name}`
    : item.name;
  checkbox.addEventListener("change", updateDeleteButtonState);
  checkboxCell.appendChild(checkbox);
  row.appendChild(checkboxCell);

  const nameCell = document.createElement("td");
  const itemLink = document.createElement("a");

  if (item.isDir) {
    itemLink.href = `/?path=${encodeURIComponent(currentPath ? `${currentPath}/${item.name}` : item.name)}`;
    itemLink.textContent = `[DIR] ${item.name}`;
    itemLink.className = "dir-link";
  } else {
    itemLink.href = `/open/${encodeURIComponent(currentPath ? `${currentPath}/${item.name}` : item.name)}`;
    itemLink.textContent = item.name;
    itemLink.className = item.name.endsWith(".ipynb")
      ? "notebook-link"
      : "file-link";
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
  dateCell.textContent = item.lastModified
    ? new Date(item.lastModified * 1000).toLocaleString()
    : "-";
  row.appendChild(dateCell);

  return row;
}

function updateDeleteButtonState() {
  const deleteButton = document.getElementById(
    "delete-button",
  ) as HTMLButtonElement | null;
  if (deleteButton) {
    deleteButton.disabled = !document.querySelector(
      'input[type="checkbox"]:checked',
    );
  }
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
  ) as HTMLButtonElement | null;
  if (!deleteButton) return;

  deleteButton.addEventListener("click", async () => {
    const selectedFiles = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"]:checked',
      ),
    ).map((cb) => cb.dataset.filepath as string);

    if (
      !selectedFiles.length ||
      !confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)
    )
      return;

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
