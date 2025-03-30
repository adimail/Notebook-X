import { useNotebookStore } from "@/store";
import { NotebookCell } from "@/types";
import { generateCellId } from "@/utils";

/**
 * Deletes a cell by its ID from the staged changes
 * @param cellId - The unique identifier of the cell to delete
 */
export function deleteCell(cellId: string): void {
  const store = useNotebookStore.getState();
  store.deleteCell(cellId);
  store.saveNotebook();
}

/**
 * Moves a cell up in the notebook's staged cell order
 * @param cellId - The unique identifier of the cell to move
 * @returns boolean indicating if the move was successful
 */
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

/**
 * Moves a cell down in the notebook's staged cell order
 * @param cellId - The unique identifier of the cell to move
 * @returns boolean indicating if the move was successful
 */
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

/**
 * Duplicates a cell and inserts it after the original in staged changes
 * @param cellId - The unique identifier of the cell to duplicate
 * @returns The new cell's ID or null if operation failed
 */
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

/**
 * Creates and adds a new cell at the specified position in staged changes
 * @param type - The type of cell to create ("code" | "markdown")
 * @param index - Optional position to insert the cell (defaults to end)
 * @returns The new cell's ID
 */
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

  const element = document.getElementById("cell-" + newCell.id);
  console.log("Scrolling to: ", newCell.id.replace("cell-", ""));
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return newCell.id;
}

// Utility type to ensure type safety in store updates
type CellUpdatePayload = Partial<
  Pick<NotebookCell, "source" | "metadata" | "outputs">
>;

/**
 * Updates a cell's properties in staged changes
 * @param cellId - The unique identifier of the cell to update
 * @param update - Object containing the properties to update
 */
export function updateCell(cellId: string, update: CellUpdatePayload): void {
  const store = useNotebookStore.getState();
  store.updateCell(cellId, update);
}
