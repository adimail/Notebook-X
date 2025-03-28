import { Cell } from "./base";
import { sendCodeExecutionRequest } from "../utils/api";
import { updateOutputVisibility } from "../utils/dom";

export class CodeCell extends Cell {
  async execute() {
    console.log("Execute cell");
    const codeElement = this.element.querySelector(
      ".code-editor textarea",
    ) as HTMLTextAreaElement;
    const outputCode = this.element.querySelector(
      ".output-code",
    ) as HTMLElement;
    const outputArea = this.element.querySelector(
      ".output-area",
    ) as HTMLElement;
    if (!codeElement || !outputCode || !outputArea) return;

    try {
      const result = await sendCodeExecutionRequest(codeElement.value);
      outputCode.textContent = JSON.stringify(result);
    } catch (error) {
      console.error("Execution error:", error);
      outputCode.textContent = "Error executing code.";
    }
    updateOutputVisibility(this.element);
  }
}
