import { Cell } from "./base";
import { sendCodeExecutionRequest } from "@/utils";
import { renderOutput } from "@/notebook/render";
import { EditorView } from "codemirror";
import { useNotebookStore } from "@/store";

export class CodeCell extends Cell {
  private editorView: EditorView | null = null;

  constructor(element: HTMLElement) {
    super(element);
    this.initEditor();
  }

  private initEditor() {
    const inputArea = this.element.querySelector(".input-area") as HTMLElement;
    if (!inputArea) {
      return;
    }

    const editorDom = inputArea.querySelector(".cm-editor");
    if (editorDom) {
      this.editorView = EditorView.findFromDOM(editorDom as HTMLElement);
    }
  }

  async execute() {
    if (!this.editorView) {
      return;
    }

    const code = this.editorView.state.doc.toString();
    const kernelId = useNotebookStore.getState().kernelId;

    if (!kernelId) {
      console.error("No kernel ID available. Please start a kernel first.");
      return;
    }

    const outputArea = this.element.querySelector(
      ".output-area",
    ) as HTMLElement;
    if (!outputArea) {
      return;
    }

    outputArea.innerHTML = "<pre>Running...</pre>";
    try {
      const result = await sendCodeExecutionRequest(kernelId, code);

      const cellContainer = this.element.closest(".cell-container");
      if (cellContainer) {
        const cellId = cellContainer.id;
        useNotebookStore.getState().updateOutputCell(cellId, result);
      }
      console.log(result);
      outputArea.innerHTML = renderOutput(
        Array.isArray(result)
          ? result.flatMap((res) => res.outputs)
          : result.outputs,
      );
    } catch (error) {
      outputArea.innerHTML = "<pre>Error executing code.</pre>";
      console.log(error);
    }
  }
}
