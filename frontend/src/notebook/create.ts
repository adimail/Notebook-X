/**
 * Creates a new notebook by prompting the user for a name and making an API request.
 * @param currentPath - The current directory path where the notebook will be created.
 */
export async function createNotebook(currentPath: string) {
  let notebookName = prompt("Enter the name of the new notebook:");
  if (!notebookName) return;

  notebookName = notebookName.replace(/\.ipynb$/i, "") + ".ipynb";

  const notebookPath = currentPath
    ? `${currentPath}/${notebookName}`
    : notebookName;

  try {
    const response = await fetch(
      `/api/notebook/create?path=${encodeURIComponent(notebookPath)}`,
      {
        method: "POST",
      },
    );

    if (response.ok) {
      location.reload();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || "Failed to create notebook"}`);
    }
  } catch (error) {
    console.error("Failed to create notebook:", error);
    alert("Failed to create notebook. Please try again.");
  }
}
