import { useNotebookStore } from "@/store";
import { CodeCell } from "@/cells/code";

export function saveNotebook() {
  const store = useNotebookStore.getState();
  store.saveNotebook();
  console.log("Notebook saved.");
}

export function runAllCells() {
  document.querySelectorAll(".code-cell").forEach((cellElement) => {
    new CodeCell(cellElement as HTMLElement).execute();
  });
}
