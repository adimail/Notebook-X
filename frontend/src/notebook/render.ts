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
  `;
  initializeCodeEditors(editorContainer, editors);
}

function renderCell(cell: NotebookCell): string {
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
                ? `<div class="output-area">${cell.outputs.map(renderOutput).join("")}</div>`
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
      extensions: [basicSetup, python(), ...gruvboxDark],
      parent,
    });
    editors.set(cellId, editor);
    textarea.remove();
  });
}

function renderOutput(output: CellOutput): string {
  if (output.output_type === "stream") {
    return `<pre class="output-code stream-output"><code>${DOMPurify.sanitize(
      Array.isArray(output.text) ? output.text.join("\n") : String(output.text),
    )}</code></pre>`;
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
    return `<pre class="output-code error-output"><code>${DOMPurify.sanitize(
      Array.isArray(output.traceback)
        ? output.traceback.join("\n")
        : String(output.traceback),
    )}</code></pre>`;
  }
  return "";
}
