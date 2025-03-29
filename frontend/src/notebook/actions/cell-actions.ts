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
