import { setupEventListeners } from "./events";
import { Notebook as RenderedNotebookData } from "@/types";
import { renderNotebook } from "@/notebook/render";
import { EditorView } from "codemirror";
import { fetchNotebook } from "@/utils/api";
import { useNotebookStore } from "@/store";
import {
  updateDOMTextareaAutoResize,
  updateDOMSaveIndicator,
} from "@/utils/dom";

class Notebook {
  private saveIndicator: HTMLElement | null = null;
  private editorContainer: HTMLElement | null = null;
  private editors: Map<string, EditorView> = new Map();

  async initialize() {
    setupEventListeners();
    this.editorContainer = document.getElementById("editor-container");
    this.saveIndicator = document.getElementById("save-indicator");

    useNotebookStore.subscribe((state) => {
      if (state.stagedChanges) {
        console.log("stagedChanges rendered");
        console.log(state.stagedChanges);
        this.render(state.stagedChanges);
      }
    });
  }

  async loadAndRender() {
    const path: string = window.location.pathname.replace("/notebook/", "");
    try {
      const notebookData: RenderedNotebookData = await fetchNotebook(path);

      useNotebookStore.getState().setNotebook(notebookData);
    } catch (error) {
      console.error("Error loading notebook:", error);
    }
  }

  render(notebookData: RenderedNotebookData) {
    if (!this.editorContainer) return;

    renderNotebook(notebookData, this.editorContainer, this.editors);

    updateDOMSaveIndicator(this.saveIndicator);

    updateDOMTextareaAutoResize();
  }
}

export { Notebook };
