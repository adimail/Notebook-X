import { useNotebookStore } from "@/store";
import { NotebookCell } from "@/types";
import { generateCellId } from "@/utils";

export function deleteCell(cellId: string): void {
  const store = useNotebookStore.getState();
  store.deleteCell(cellId);
  store.saveNotebook();
}

export function moveCellUp(cellId: string): boolean {
  const store = useNotebookStore.getState();
  if (!store.stagedChanges) return false;

  const cells = [...store.stagedChanges.cells];
  const currentIndex = cells.findIndex((cell) => cell.id === cellId);

  if (currentIndex <= 0) return false; // Can't move up if at top or not found

  // Swap with previous cell
  [cells[currentIndex - 1], cells[currentIndex]] = [
    cells[currentIndex],
    cells[currentIndex - 1],
  ];

  store.setNotebook({
    ...store.stagedChanges,
    cells,
  });

  return true;
}

export function moveCellDown(cellId: string): boolean {
  const store = useNotebookStore.getState();
  if (!store.stagedChanges) return false;

  const cells = [...store.stagedChanges.cells];
  const currentIndex = cells.findIndex((cell) => cell.id === cellId);

  if (currentIndex === -1 || currentIndex === cells.length - 1) return false; // Can't move down if at bottom or not found

  // Swap with next cell
  [cells[currentIndex], cells[currentIndex + 1]] = [
    cells[currentIndex + 1],
    cells[currentIndex],
  ];

  store.setNotebook({
    ...store.stagedChanges,
    cells,
  });

  return true;
}

export function duplicateCell(cellId: string): string | null {
  const store = useNotebookStore.getState();
  if (!store.stagedChanges) return null;

  const cells = store.stagedChanges.cells;
  const cellIndex = cells.findIndex((cell) => cell.id === cellId);

  if (cellIndex === -1) return null;

  const originalCell = cells[cellIndex];
  const newCell: NotebookCell = {
    ...originalCell,
    id: generateCellId(),
    metadata: { ...originalCell.metadata },
    source: originalCell.source,
  };

  store.addCell(newCell, cellIndex + 1);
  return newCell.id;
}

export function createCell(type: "code" | "markdown", index?: number): string {
  const store = useNotebookStore.getState();
  const newCell: NotebookCell = {
    id: generateCellId(),
    cell_type: type,
    source: "",
    metadata: {},
    ...(type === "code" && { outputs: [], execution_count: null }),
  };

  console.log(newCell.id, "Cell created");

  store.addCell(newCell, index);

  return newCell.id;
}

// Utility type to ensure type safety in store updates
type CellUpdatePayload = Partial<
  Pick<NotebookCell, "source" | "metadata" | "outputs">
>;

export function updateCell(cellId: string, update: CellUpdatePayload): void {
  const store = useNotebookStore.getState();
  store.updateCell(cellId, update);
}
