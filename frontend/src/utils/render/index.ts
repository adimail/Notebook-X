import "./toolbar";
import {
  fetchEntireDirectoryStructure,
  getItemsAtPath,
} from "../../components/api";
import { getQueryParam, renderDirectoryListing } from "./tree";

document.addEventListener("DOMContentLoaded", async () => {
  const currentPath = getQueryParam("path");
  try {
    const directoryTree = await fetchEntireDirectoryStructure();
    const items = getItemsAtPath(directoryTree, currentPath);
    renderDirectoryListing(items, currentPath);
  } catch (error) {
    console.error("Error loading directory:", error);
  }
});
