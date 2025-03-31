import { useNotebookStore } from "@/store";

export function saveNotebook() {
  const store = useNotebookStore.getState();
  store.saveNotebook();
  console.log("Notebook saved.");
}

export function resetNotebook() {
  const store = useNotebookStore.getState();
  if (store.notebook) {
    store.setNotebook(store.notebook);
    console.log("Notebook reset to last saved version.");
  } else {
    console.log("No saved notebook found.");
  }
}

export function undoAction() {
  console.log("Undo action triggered (TODO: Implement undo history).");
}
