import { setupEventListeners } from "./events";
import { RenderedNotebookData } from "@/types";
import { renderNotebook } from "@/notebook/render";
import { EditorView } from "codemirror";
import { fetchNotebook } from "@/utils/api";
import {
  updateDOMTextareaAutoResize,
  updateDOMSaveIndicator,
} from "@/utils/dom";

class Notebook {
  private originalContent: string[] = [];
  private saveIndicator: HTMLElement | null = null;
  private editorContainer: HTMLElement | null = null;
  private editors: Map<string, EditorView> = new Map();

  async initialize() {
    setupEventListeners();
    this.editorContainer = document.getElementById("editor-container");
    this.saveIndicator = document.getElementById("save-indicator");
  }

  async loadAndRender() {
    const path: string = window.location.pathname.replace("/notebook/", "");
    try {
      const notebookData: RenderedNotebookData = await fetchNotebook(path);
      renderNotebook(notebookData, this.editorContainer!, this.editors);
      updateDOMSaveIndicator(
        this.editorContainer,
        this.saveIndicator,
        this.originalContent,
      );
      updateDOMTextareaAutoResize();
    } catch (error) {
      console.error("Error loading notebook:", error);
    }
  }
}

export { Notebook };
