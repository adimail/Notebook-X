import { CodeCell } from "@/cells/code";

export function runCodeCell(cellId: string) {
  const allCells = document.querySelectorAll(".cell-container");
  let cellElement: HTMLElement | null = null;

  allCells.forEach((cell) => {
    if (cell.id === `cell-${cellId}`) {
      cellElement = cell as HTMLElement;
    }
  });

  if (!cellElement) {
    console.error("Cell not found for ID:", cellId);
    return;
  }

  new CodeCell(cellElement).execute();
}
