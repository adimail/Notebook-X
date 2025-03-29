import { notebookxMarkdownRender } from "@/notebook/render";

export function toggleMarkdownEdit(cellElement: HTMLElement) {
  const editorArea = cellElement.querySelector(
    "textarea.input-code",
  ) as HTMLTextAreaElement | null;
  const renderedArea = cellElement.querySelector(
    ".rendered-markdown",
  ) as HTMLElement | null;
  const editBtn = cellElement.querySelector(
    ".edit-markdown-btn",
  ) as HTMLButtonElement | null;

  if (!editorArea || !renderedArea || !editBtn) {
    console.error("Missing elements in markdown cell", cellElement);
    return;
  }

  const isEditing = cellElement.dataset.editing === "true";

  if (isEditing) {
    const newMarkdown = editorArea.value.trim();
    renderedArea.innerHTML = notebookxMarkdownRender(newMarkdown);
    cellElement.dataset.source = newMarkdown;

    editorArea.closest(".input-area")?.classList.add("hidden");
    renderedArea.classList.remove("hidden");

    editBtn.textContent = "Edit";
    cellElement.dataset.editing = "false";
  } else {
    editorArea.value = cellElement.dataset.source || "";
    editorArea.closest(".input-area")?.classList.remove("hidden");
    renderedArea.classList.add("hidden");

    editBtn.textContent = "Save";
    cellElement.dataset.editing = "true";
  }
}
