import { CodeCell } from "@/cells/code";

export function setupEventListeners() {
  document.querySelectorAll(".code-cell .run-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cellElement = (btn as HTMLElement).closest(".cell") as HTMLElement;
      new CodeCell(cellElement).execute();
    });
  });
}

export async function createNotebook(currentPath: string) {
  const notebookName = prompt("Enter the name of the new notebook:");
  if (!notebookName) return;

  const notebookPath = `${currentPath ? currentPath + "/" : ""}${notebookName}.ipynb`;

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
      alert(`Error: ${error.message}`);
    }
  } catch (error) {
    console.error("Failed to create notebook:", error);
    alert("Failed to create notebook. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll(".cell-container");

  if (!cells) return;

  cells.forEach((cell) => {
    if (!(cell instanceof HTMLElement)) return;

    const toolbar = cell.querySelector(".cell-toolbar") as HTMLElement | null;
    if (!toolbar) return;

    cell.addEventListener("mouseenter", () => {
      toolbar.style.opacity = "1";
    });

    cell.addEventListener("mouseleave", () => {
      toolbar.style.opacity = "0";
    });
  });
});
