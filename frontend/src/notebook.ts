import { Notebook } from "@/notebook/index";

document.addEventListener("DOMContentLoaded", () => {
  const notebook = new Notebook();
  notebook.loadAndRender();
  notebook.initialize();
});
