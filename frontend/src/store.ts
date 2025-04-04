import { createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import { Notebook, NotebookCell, ExecutionResults } from "@/types";
import { saveNotebookInFileSystem } from "@/utils/api";

interface NotebookStore {
  notebook: Notebook | null;
  stagedChanges: Notebook | null;
  kernelId: string | null;

  setKernelId: (kernelId: string | null) => void;
  setNotebook: (notebook: Notebook) => void;
  updateCell: (cellId: string, update: Partial<NotebookCell>) => void;
  updateOutputCell: (cellId: string, output: ExecutionResults) => void;
  addCell: (cell: NotebookCell, index?: number) => void;
  deleteCell: (cellId: string) => void;
  saveNotebook: () => void;
}

export const useNotebookStore = createStore(
  subscribeWithSelector<NotebookStore>((set, get) => ({
    notebook: null,
    stagedChanges: null,
    kernelId: null,

    setKernelId: (kernelId) => set({ kernelId }),
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

    updateOutputCell: (cellId: string, output: ExecutionResults) =>
      set((state) => ({
        stagedChanges: state.stagedChanges
          ? {
              ...state.stagedChanges,
              cells: state.stagedChanges.cells.map((cell) =>
                cell.id === cellId
                  ? {
                      ...cell,
                      execution_count: output.execution_count,
                      outputs: output.outputs,
                    }
                  : cell,
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
        return {
          notebook: { ...state.stagedChanges, cells: newCells },
          stagedChanges: { ...state.stagedChanges, cells: newCells },
        };
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

    saveNotebook: async () => {
      set((state) => ({
        notebook: state.stagedChanges
          ? { ...state.stagedChanges }
          : state.notebook,
      }));

      await saveNotebookInFileSystem(get().notebook);
    },
  })),
);
