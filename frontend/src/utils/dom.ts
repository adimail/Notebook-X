export function updateOutputVisibility(cell: HTMLElement): void {
  const outputArea = cell.querySelector(".output-area") as HTMLElement;
  const outputCode = cell.querySelector(".output-code") as HTMLElement;
  outputArea.style.display = outputCode?.textContent?.trim() ? "block" : "none";
}
