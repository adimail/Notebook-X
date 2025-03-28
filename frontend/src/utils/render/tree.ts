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

  // Create table
  const table = document.createElement("table");
  table.className = "directory-table";

  // Table header
  const headerRow = document.createElement("tr");
  ["Name", "Type", "Size (KB)", "Last Modified"].forEach((title) => {
    const th = document.createElement("th");
    th.textContent = title;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Table rows
  items.forEach((item) => {
    const row = document.createElement("tr");

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
      itemLink.className = "file-link";
    }

    nameCell.appendChild(itemLink);
    row.appendChild(nameCell);

    // Type
    const typeCell = document.createElement("td");
    typeCell.textContent = item.type || "unknown";
    row.appendChild(typeCell);

    // Size
    const sizeCell = document.createElement("td");
    sizeCell.textContent = item.size ? (item.size / 1024).toFixed(2) : "-";
    row.appendChild(sizeCell);

    // Last Modified
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
