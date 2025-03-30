import { saveNotebook } from "./actions";

export function setupShortcuts() {
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      saveNotebook();
    }
  });
}
