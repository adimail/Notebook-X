import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { Notebook, NotebookCell } from "@/types";

interface NotebookStore {
  notebook: Notebook | null;
  stagedChanges: Notebook | null;

  setNotebook: (notebook: Notebook) => void;
  updateCell: (cellId: string, update: Partial<NotebookCell>) => void;
  addCell: (cell: NotebookCell, index?: number) => void;
  deleteCell: (cellId: string) => void;
  saveNotebook: () => void;
}

export const useNotebookStore = createStore(
  subscribeWithSelector<NotebookStore>((set) => ({
    notebook: null,
    stagedChanges: null,

    setNotebook: (notebook) =>
      set(() => ({ notebook, stagedChanges: notebook })),

    updateCell: (cellId, update) =>
      set((state) => ({
        stagedChanges: state.stagedChanges
          ? {
              ...state.stagedChanges,
              cells: state.stagedChanges.cells.map((cell) =>
                cell.id === cellId ? { ...cell, ...update } : cell,
              ),
            }
          : state.stagedChanges,
      })),

    addCell: (cell, index) =>
      set((state) => {
        if (!state.stagedChanges) return state;
        const newCells = [...state.stagedChanges.cells];
        index !== undefined
          ? newCells.splice(index, 0, cell)
          : newCells.push(cell);
        return { stagedChanges: { ...state.stagedChanges, cells: newCells } };
      }),

    deleteCell: (cellId) =>
      set((state) => ({
        stagedChanges: state.stagedChanges
          ? {
              ...state.stagedChanges,
              cells: state.stagedChanges.cells.filter(
                (cell) => cell.id !== cellId,
              ),
            }
          : state.stagedChanges,
      })),

    saveNotebook: () =>
      set((state) => ({
        notebook: state.stagedChanges
          ? { ...state.stagedChanges }
          : state.notebook,
      })),
  })),
);
