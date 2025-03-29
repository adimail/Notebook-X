import { getQueryParam, renderDirectoryListing } from "./utils";

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
});
