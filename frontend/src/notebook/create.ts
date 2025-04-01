export async function createNotebook(currentPath: string) {
  const notebookName =
    prompt("Enter the name of the new notebook")?.replace(/\.ipynb$/i, "") +
    ".ipynb";
  if (!notebookName) return;

  const notebookPath = currentPath
    ? `${currentPath}/${notebookName}`
    : notebookName;

  try {
    const response = await fetch(
      `/api/notebook/create?path=${encodeURIComponent(notebookPath)}`,
      { method: "POST" },
    );

    if (!response.ok) {
      throw new Error(
        (await response.json()).message || "Failed to create notebook",
      );
    }

    location.reload();
  } catch (error) {
    console.error("Failed to create notebook:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Failed to create notebook. Please try again.",
    );
  }
}
