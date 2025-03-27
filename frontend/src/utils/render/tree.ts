import { DirectoryItem } from "../../components/api";

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

  items.forEach((item) => {
    const itemLink = document.createElement("a");
    if (item.isDir) {
      const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
      itemLink.href = `/?path=${encodeURIComponent(newPath)}`;
      itemLink.textContent = `[DIR] ${item.name}`;
      itemLink.className = "dir-link";
    } else {
      itemLink.href = "#";
      itemLink.textContent = item.name;
      itemLink.className = "file-link";
    }
    container.appendChild(itemLink);
    container.appendChild(document.createElement("br"));
  });
}
