import { Parser, HtmlRenderer } from "commonmark";
import DOMPurify from "dompurify";
import {
  Notebook as RenderedNotebookData,
  NotebookCell,
  CellOutput,
} from "@/types";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { gruvboxDark } from "@/themes";
import { useNotebookStore } from "@/store";
import { createCell } from "./actions";

export function notebookxMarkdownRender(mdText: string): string {
  const reader = new Parser();
  const writer = new HtmlRenderer();
  const parsed = reader.parse(mdText);
  return DOMPurify.sanitize(writer.render(parsed));
}

export function renderNotebook(
  notebookData: RenderedNotebookData,
  editorContainer: HTMLElement,
  editors: Map<string, EditorView>,
): void {
  if (!editorContainer) return;
  editorContainer.innerHTML = `
    <div class="notebook">
      ${notebookData.cells.map((cell: NotebookCell) => renderCell(cell)).join("")}
    </div>
    <div class="add-cell-buttons">
      <button class="new-code-cell-btn">+ Code</button>
      <button class="new-markdown-cell-btn">+ Markdown</button>
    </div>
  `;

  initializeCodeEditors(editorContainer, editors);

  // Add event listeners to buttons
  const codeButton = editorContainer.querySelector(".new-code-cell-btn");
  const markdownButton = editorContainer.querySelector(
    ".new-markdown-cell-btn",
  );

  if (codeButton) {
    codeButton.addEventListener("click", () => createCell("code"));
  }

  if (markdownButton) {
    markdownButton.addEventListener("click", () => createCell("markdown"));
  }
}

function renderCell(cell: NotebookCell): string {
  const sourceContent: string = DOMPurify.sanitize(
    Array.isArray(cell.source) ? cell.source.join("") : String(cell.source),
  );

  const commonButtons = `
    <div class="add-cell-buttons cell-toolbar">
      <button class="add-code-btn" data-index="${cell.id}">+ Code</button>
      <button class="add-markdown-btn" data-index="${cell.id}">+ Markdown</button>
    </div>
  `;

  if (cell.cell_type === "code") {
    return `
      <div class="cell-container" id="${cell.id}"">
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
            <div class="output-area">${cell?.outputs?.map((output) => renderOutput([output])).join("")}</div>
          </div>
        </div>
        ${commonButtons}
      </div>
    `;
  } else {
    return `
      <div class="cell-container" id="${cell.id}"">
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
			<div class="rendered-markdown">${sourceContent.trim() ? notebookxMarkdownRender(sourceContent) : "<h3>(empty markdown cell)</h3>"}</div>
          </div>
        </div>
        ${commonButtons}
      </div>
    `;
  }
}

function initializeCodeEditors(
  editorContainer: HTMLElement,
  editors: Map<string, EditorView>,
): void {
  const codeCells = editorContainer.querySelectorAll(
    ".code-cell .input-area textarea",
  );

  codeCells.forEach((textarea: Element) => {
    const parent = textarea.parentElement as HTMLElement;
    const cellContainer = parent.closest(".cell-container") as HTMLElement;
    const cellId = cellContainer.id;

    const editor = new EditorView({
      doc: (textarea as HTMLTextAreaElement).value,
      extensions: [
        basicSetup,
        python(),
        ...gruvboxDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newCode = editor.state.doc.toString();
            useNotebookStore.getState().updateCell(cellId, { source: newCode });
          }
        }),
      ],
      parent,
    });

    editors.set(cellId, editor);
    textarea.remove();
  });

  if (!editorContainer.dataset.listenerAttached) {
    editorContainer.dataset.listenerAttached = "true";

    editorContainer.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      if (target.classList.contains("add-code-btn")) {
        const cellId = target.dataset.index;
        const store = useNotebookStore.getState();
        const index = store.notebook?.cells.findIndex(
          (cell) => cell.id === cellId,
        );
        createCell("code", index !== undefined ? index + 1 : undefined);
      }

      if (target.classList.contains("add-markdown-btn")) {
        const cellId = target.dataset.index;
        const store = useNotebookStore.getState();
        const index = store.notebook?.cells.findIndex(
          (cell) => cell.id === cellId,
        );
        createCell("markdown", index !== undefined ? index + 1 : undefined);
      }
    });
  }
}

export function renderOutput(outputs: CellOutput[]): string {
  return outputs
    .map((output) => {
      if (output.output_type === "stream") {
        const text = output.text || "";
        return `<pre class="output-code stream-output"><code>${DOMPurify.sanitize(text)}</code></pre>`;
      }

      if (
        output.output_type === "display_data" ||
        output.output_type === "execute_result"
      ) {
        if (output.data) {
          if (output.data["text/html"]) {
            return `<div class="output-html">${DOMPurify.sanitize(output.data["text/html"])}</div>`;
          }
          if (output.data["image/png"]) {
            return `<img class="output-image" src="data:image/png;base64,${output.data["image/png"]}" />`;
          }
          if (output.data["image/jpeg"]) {
            return `<img class="output-image" src="data:image/jpeg;base64,${output.data["image/jpeg"]}" />`;
          }
          if (output.data["text/plain"]) {
            return `<pre class="output-code"><code>${DOMPurify.sanitize(output.data["text/plain"])}</code></pre>`;
          }
          if (output.data["application/javascript"]) {
            return `<script>${output.data["application/javascript"]}</script>`;
          }
          if (output.data["application/json"]) {
            return `<pre class="output-code output-json"><code>${DOMPurify.sanitize(
              JSON.stringify(output.data["application/json"], null, 2),
            )}</code></pre>`;
          }
        }
        return `<pre class="output-code"><code>Unknown output format</code></pre>`;
      }

      if (output.output_type === "error") {
        const errorMessage = output.traceback
          ? output.traceback.join("\n")
          : "Unknown error";
        return `<pre class="output-code error-output"><code>${DOMPurify.sanitize(errorMessage)}</code></pre>`;
      }

      return `<pre class="output-code"><code>Unrecognized output type: ${output.output_type}</code></pre>`;
    })
    .join("");
}
