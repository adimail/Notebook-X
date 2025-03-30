import { useNotebookStore } from "@/store";
import { createCell } from "./cell-actions";

/**
 * Saves the staged changes to the actual notebook
 */
export function saveNotebook() {
  const store = useNotebookStore.getState();
  store.saveNotebook();
  console.log("Notebook saved.");
}

/**
 * Resets staged changes to the last saved notebook version
 */
export function resetNotebook() {
  const store = useNotebookStore.getState();
  if (store.notebook) {
    store.setNotebook(store.notebook);
    console.log("Notebook reset to last saved version.");
  } else {
    console.log("No saved notebook found.");
  }
}

/**
 * Adds a new cell at the end of the notebook
 * @param type - The type of the new cell ("code" | "markdown")
 */
export function createNewCell() {
  createCell("code");
}

/**
 * Placeholder function for undo functionality
 */
export function undoAction() {
  console.log("Undo action triggered (TODO: Implement undo history).");
}
