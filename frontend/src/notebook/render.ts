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
			<div class="output-area">${cell?.outputs?.map(renderOutput).join("")}</div>
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
    const cellId = cellContainer.id.replace("cell-", "");

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

  editorContainer.addEventListener("input", (event) => {
    const target = event.target as HTMLTextAreaElement;
    if (target.classList.contains("input-code")) {
      const cellContainer = target.closest(".cell-container") as HTMLElement;
      const cellId = cellContainer.id.replace("cell-", "");
      useNotebookStore.getState().updateCell(cellId, { source: target.value });
    }
  });
}

export function renderOutput(output: CellOutput): string {
  if (output.output_type === "stream") {
    return `<pre class="output-code stream-output"><code>${DOMPurify.sanitize(
      Array.isArray(output.text) ? output.text.join("\n") : String(output.text),
    )}</code></pre>`;
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
        return `<pre class="output-code output-html"><code>${DOMPurify.sanitize(output.data["text/plain"])}</code></pre>`;
      }
      if (output.data["application/javascript"]) {
        return `<script>${output.data["application/javascript"]}</script>`;
      }
      if (output.data["application/json"]) {
        return `<pre class="output-code output-json"><code>${DOMPurify.sanitize(
          JSON.stringify(output.data["application/json"], null, 2),
        )}</code></pre>`;
      }
      if (output.data["text/markdown"]) {
        return `<div class="output-markdown">${DOMPurify.sanitize(output.data["text/markdown"])}</div>`;
      }
    }
    return `<pre class="output-code"><code>Unknown output format</code></pre>`;
  }

  if (output.output_type === "error") {
    return `<pre class="output-code error-output"><code>${DOMPurify.sanitize(
      output.traceback ? output.traceback.join("\n") : "Unknown error",
    )}</code></pre>`;
  }

  return `<pre class="output-code"><code>Unrecognized output type ${output.toString()}</code></pre>`;
}
