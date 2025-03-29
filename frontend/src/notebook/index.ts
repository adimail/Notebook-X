import { setupEventListeners } from "./events";
import { RenderedNotebookData, NotebookCell, CellOutput } from "@/types";
import { notebookxMarkdownRender } from "@/notebook/render";
import DOMPurify from "dompurify";

class Notebook {
  private originalContent: string[] = [];
  private saveIndicator: HTMLElement | null = null;
  private editorContainer: HTMLElement | null = null;

  async initialize(): Promise<void> {
    setupEventListeners();
    this.editorContainer = document.getElementById("editor-container");
    this.saveIndicator = document.getElementById("save-indicator");
  }

  async loadAndRender() {
    const path: string = window.location.pathname.replace("/notebook/", "");
    try {
      const notebookData: RenderedNotebookData = await this.fetchNotebook(path);
      this.renderNotebook(notebookData);
      this.setupSaveIndicator();
      this.setupTextareaAutoResize();
    } catch (error) {
      console.error("Error loading notebook:", error);
    }
  }

  async fetchNotebook(path: string): Promise<RenderedNotebookData> {
    const response = await fetch(
      `/api/load_notebook?path=${encodeURIComponent(path)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to load notebook");
    }

    const data = await response.json();
    return data as RenderedNotebookData;
  }

  renderNotebook(notebookData: RenderedNotebookData): void {
    if (!this.editorContainer) return;
    this.editorContainer.innerHTML = `
      <div class="notebook">
        ${notebookData.cells.map((cell: NotebookCell) => this.renderCell(cell)).join("")}
      </div>
    `;
  }

  renderCell(cell: NotebookCell): string {
    const sourceContent: string = DOMPurify.sanitize(
      Array.isArray(cell.source) ? cell.source.join("") : String(cell.source),
    );
    if (cell.cell_type === "code") {
      return `
        <div class="cell-container" id="cell-${cell.id}" data-source="${sourceContent}">
          <div class="cell-toolbar">
            <button class="run-btn">Run</button>
            <button class="move-up-btn">▲</button>
            <button class="move-down-btn">▼</button>
            <button class="duplicate-btn">Duplicate</button>
            <button class="delete-btn">Delete</button>
          </div>
          <div class="nb-container">
            <span class="execution-count">[${cell.execution_count || ""}]</span>
            <div class="cell code-cell">
              <div class="input-area">
                <textarea class="input-code">${sourceContent}</textarea>
              </div>
              ${
                cell.outputs && cell.outputs.length
                  ? `
                <div class="output-area">
                  ${cell.outputs.map((output: CellOutput) => this.renderOutput(output)).join("")}
                </div>
              `
                  : ""
              }
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="cell-container" id="cell-${cell.id}" data-source="${sourceContent}">
          <div class="cell-toolbar">
            <button class="edit-markdown-btn">Edit</button>
            <button class="move-up-btn">▲</button>
            <button class="move-down-btn">▼</button>
            <button class="duplicate-btn">Duplicate</button>
            <button class="delete-btn">Delete</button>
          </div>
          <div class="nb-container">
            <span class="execution-count"></span>
            <div class="cell markdown-cell">
              <div class="input-area hidden">
                <textarea class="input-code">${sourceContent}</textarea>
              </div>
              <div class="rendered-markdown">${notebookxMarkdownRender(sourceContent)}</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  renderOutput(output: CellOutput): string {
    if (output.output_type === "stream") {
      return `<pre class="output-code stream-output"><code>${DOMPurify.sanitize(Array.isArray(output.text) ? output.text.join("\n") : String(output.text))}</code></pre>`;
    } else if (
      output.output_type === "display_data" ||
      output.output_type === "execute_result"
    ) {
      if (output.data && output.data["text/html"]) {
        return `<div class="output-html">${DOMPurify.sanitize(output.data["text/html"])}</div>`;
      } else if (output.data && output.data["image/png"]) {
        return `<img class="output-image" src="data:image/png;base64,${output.data["image/png"]}" />`;
      } else if (output.data && output.data["text/plain"]) {
        return `<pre class="output-code output-html"><code>${DOMPurify.sanitize(output.data["text/plain"])}</code></pre>`;
      } else {
        return `<pre class="output-code"><code>Unknown output format</code></pre>`;
      }
    } else if (output.output_type === "error") {
      return `<pre class="output-code error-output"><code>${DOMPurify.sanitize(Array.isArray(output.traceback) ? output.traceback.join("\n") : String(output.traceback))}</code></pre>`;
    }
    return "";
  }

  // =====================================
  // Textarea Auto Resize Logic
  // =====================================

  private setupTextareaAutoResize(): void {
    document
      .querySelectorAll<HTMLTextAreaElement>(".input-code")
      .forEach((textarea) => {
        const adjustHeight = (el: HTMLTextAreaElement) => {
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        };

        const adjustOnChange = () => {
          requestAnimationFrame(() => {
            setTimeout(() => adjustHeight(textarea), 0);
          });
        };

        textarea.addEventListener("input", adjustOnChange);
        textarea.addEventListener("focus", adjustOnChange);
        textarea.addEventListener("paste", adjustOnChange);

        adjustHeight(textarea);
      });
  }

  // =========================================================
  //
  // Save indicator logic
  //
  // =========================================================

  private updateSaveIndicator(saved: boolean): void {
    if (!this.saveIndicator) return;
    this.saveIndicator.classList.toggle("saved", saved);
    this.saveIndicator.classList.toggle("unsaved", !saved);
  }

  private storeOriginalContent(): void {
    if (!this.editorContainer) return;
    this.originalContent = Array.from(
      this.editorContainer.querySelectorAll("textarea"),
    ).map((textarea) => (textarea as HTMLTextAreaElement).value);
    this.updateSaveIndicator(true);
  }

  private checkForChanges(): void {
    if (!this.editorContainer) return;
    const currentContent = Array.from(
      this.editorContainer.querySelectorAll("textarea"),
    ).map((textarea) => (textarea as HTMLTextAreaElement).value);
    const isSaved =
      JSON.stringify(this.originalContent) === JSON.stringify(currentContent);
    this.updateSaveIndicator(isSaved);
  }

  private setupSaveIndicator(): void {
    if (!this.editorContainer) return;

    this.storeOriginalContent();

    this.editorContainer.querySelectorAll("textarea").forEach((textarea) => {
      textarea.addEventListener("input", () => this.checkForChanges());
    });
  }
}

export { Notebook };
