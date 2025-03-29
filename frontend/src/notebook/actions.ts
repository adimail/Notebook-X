import { CodeCell } from "@/cells/code";
import { notebookxMarkdownRender } from "./render";

export function runCodeCell(cellElement: HTMLElement) {
  new CodeCell(cellElement).execute();
}

export function deleteCell(cellElement: HTMLElement) {
  cellElement.remove();
}

export function moveCellUp(cellElement: HTMLElement) {
  const prev = cellElement.previousElementSibling;
  if (prev) {
    cellElement.parentNode?.insertBefore(cellElement, prev);
  }
}

export function moveCellDown(cellElement: HTMLElement) {
  const next = cellElement.nextElementSibling;
  if (next) {
    cellElement.parentNode?.insertBefore(next, cellElement);
  }
}

export function duplicateCell(cellElement: HTMLElement) {
  const clone = cellElement.cloneNode(true) as HTMLElement;
  cellElement.parentNode?.insertBefore(clone, cellElement.nextSibling);
}

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

export function saveNotebook() {
  console.log("Save button clicked");
}

export function undoAction() {
  console.log("Undo button clicked");
}

export function resetNotebook() {
  console.log("Reset button clicked");
}

export function createNewCell() {
  console.log("New Cell button clicked");
}
