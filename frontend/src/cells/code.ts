import { Cell } from "./base";
import { sendCodeExecutionRequest } from "@/utils";
import { EditorView } from "codemirror";

export class CodeCell extends Cell {
  private editorView: EditorView | null = null;

  constructor(element: HTMLElement) {
    super(element);
    this.initEditor();
  }

  private initEditor() {
    const inputArea = this.element.querySelector(".input-area") as HTMLElement;
    if (!inputArea) return;

    const editorDom = inputArea.querySelector(".cm-editor");
    if (editorDom) {
      this.editorView = EditorView.findFromDOM(editorDom as HTMLElement);
    }
  }

  async execute() {
    console.log("Execute cell");
    if (!this.editorView) return;

    const code = this.editorView.state.doc.toString();
    const outputCode = this.element.querySelector(
      ".output-code",
    ) as HTMLElement;
    const outputArea = this.element.querySelector(
      ".output-area",
    ) as HTMLElement;
    if (!outputCode || !outputArea) return;

    try {
      const result = await sendCodeExecutionRequest(code);
      outputCode.textContent = JSON.stringify(result);
    } catch (error) {
      console.error("Execution error:", error);
      outputCode.textContent = "Error executing code.";
    }
  }
}
