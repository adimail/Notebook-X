import { useNotebookStore } from "@/store";
import { NotebookCell } from "@/types";
import { generateCellId } from "@/utils";

export function deleteCell(cellId: string): void {
  useNotebookStore.getState().deleteCell(cellId);
  useNotebookStore.getState().saveNotebook();
}

export function moveCellUp(cellId: string): boolean {
  const store = useNotebookStore.getState();
  const { stagedChanges } = store;
  if (!stagedChanges) return false;

  const { cells, nbformat = 4, nbformat_minor = 0 } = stagedChanges;
  const currentIndex = cells.findIndex((cell) => cell.id === cellId);
  if (currentIndex <= 0) return false;

  [cells[currentIndex - 1], cells[currentIndex]] = [
    cells[currentIndex],
    cells[currentIndex - 1],
  ];

  store.setNotebook({ cells, nbformat, nbformat_minor });
  return true;
}

export function moveCellDown(cellId: string): boolean {
  const store = useNotebookStore.getState();
  const { stagedChanges } = store;
  if (!stagedChanges) return false;

  const { cells, nbformat = 4, nbformat_minor = 0 } = stagedChanges;
  const currentIndex = cells.findIndex((cell) => cell.id === cellId);
  if (currentIndex === -1 || currentIndex === cells.length - 1) return false;

  [cells[currentIndex], cells[currentIndex + 1]] = [
    cells[currentIndex + 1],
    cells[currentIndex],
  ];

  store.setNotebook({ cells, nbformat, nbformat_minor });
  return true;
}

export function duplicateCell(cellId: string): string | null {
  const store = useNotebookStore.getState();
  const cells = store.stagedChanges?.cells;
  if (!cells) return null;

  const cellIndex = cells.findIndex((cell) => cell.id === cellId);
  if (cellIndex === -1) return null;

  const newCell = structuredClone(cells[cellIndex]);
  newCell.id = generateCellId();

  store.addCell(newCell, cellIndex + 1);
  return newCell.id;
}

export function createCell(type: "code" | "markdown", index?: number): string {
  const newCell: NotebookCell = {
    id: generateCellId(),
    cell_type: type,
    source: "",
    metadata: {},
    ...(type === "code" && { outputs: [], execution_count: null }),
  };

  useNotebookStore.getState().addCell(newCell, index);
  return newCell.id;
}

type CellUpdatePayload = Partial<
  Pick<NotebookCell, "source" | "metadata" | "outputs">
>;

export function updateCell(cellId: string, update: CellUpdatePayload): void {
  useNotebookStore.getState().updateCell(cellId, update);
}
