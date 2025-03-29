import { CodeCell } from "@/cells/code";

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

export function editMarkdownCell(cellElement: HTMLElement) {
  console.log("Edit Markdown button clicked", cellElement);
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
