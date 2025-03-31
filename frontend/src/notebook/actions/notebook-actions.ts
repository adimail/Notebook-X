import { useNotebookStore } from "@/store";

export function saveNotebook() {
  const store = useNotebookStore.getState();
  store.saveNotebook();
  console.log("Notebook saved.");
}
