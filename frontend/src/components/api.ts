import { DirectoryItem } from "../types";

async function fetchEntireDirectoryStructure(
  rootPath: string = "",
): Promise<DirectoryItem> {
  const url = rootPath
    ? `/api/files?path=${encodeURIComponent(rootPath)}`
    : "/api/files";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch directory structure");
  }
  return await response.json();
}

function getItemsAtPath(
  tree: DirectoryItem,
  targetPath: string,
): DirectoryItem[] {
  if (!targetPath || targetPath === "/") {
    return tree.children || [];
  }

  const pathParts = targetPath.split("/").filter(Boolean);
  let current = tree;

  for (const part of pathParts) {
    const next = (current.children || []).find(
      (item) => item.name === part && item.isDir,
    );
    if (!next) {
      return [];
    }
    current = next;
  }
  return current.children || [];
}

export { fetchEntireDirectoryStructure, getItemsAtPath, DirectoryItem };
