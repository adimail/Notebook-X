import { notebookxMarkdownRender } from "@/notebook/render";
import { useNotebookStore } from "@/store";

export function toggleMarkdownEdit(cellId: string): void {
  const cellElement = document.getElementById(cellId);
  if (!cellElement) return console.error("Cell not found:", cellId);

  const editorArea = cellElement.querySelector(
    "textarea.input-code",
  ) as HTMLTextAreaElement | null;
  const renderedArea = cellElement.querySelector(
    ".rendered-markdown",
  ) as HTMLElement | null;
  const editBtn = cellElement.querySelector(
    ".edit-markdown-btn",
  ) as HTMLButtonElement | null;
  if (!editorArea || !renderedArea || !editBtn) return;

  const isEditing = cellElement.dataset.editing === "true";
  cellElement.dataset.editing = String(!isEditing);

  const { updateCell, stagedChanges } = useNotebookStore.getState();
  const cell = stagedChanges?.cells.find(
    (c: { id: string }) => c.id === cellId,
  );
  if (!cell) return console.error("Cell not found in store:", cellId);

  if (isEditing) {
    updateCell(cellId, { source: editorArea.value.trim() });
    renderedArea.innerHTML = notebookxMarkdownRender(
      editorArea.value.trim() || "<h3>(empty markdown cell)</h3>",
    );
  } else {
    editorArea.value = cell.source || renderedArea.innerText.trim();
  }

  editorArea.closest(".input-area")?.classList.toggle("hidden", isEditing);
  renderedArea.classList.toggle("hidden", !isEditing);
  editBtn.textContent = isEditing ? "Edit" : "Save";
}
