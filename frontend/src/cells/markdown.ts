import { Cell } from "./base";
import { notebookxMarkdownRender } from "@/notebook/render";

export class MarkdownCell extends Cell {
  constructor(element: HTMLElement) {
    super(element);
    this.setupEditor();
    this.renderMarkdown();
  }

  private setupEditor() {
    const editBtn = this.element.querySelector(
      ".edit-markdown-btn",
    ) as HTMLButtonElement;
    const renderedArea = this.element.querySelector(
      ".rendered-markdown",
    ) as HTMLElement;
    const editorArea = this.element.querySelector(
      ".markdown-editor",
    ) as HTMLTextAreaElement;

    if (!editBtn || !renderedArea || !editorArea) return;

    editBtn.addEventListener("click", () => {
      if (editorArea.style.display === "none") {
        editorArea.value = renderedArea.innerText.trim();
        editorArea.style.display = "block";
        renderedArea.style.display = "none";
        editBtn.textContent = "Save";
      } else {
        renderedArea.innerHTML = notebookxMarkdownRender(editorArea.value);
        editorArea.style.display = "none";
        renderedArea.style.display = "block";
        editBtn.textContent = "Edit";
      }
    });
  }

  private renderMarkdown() {
    const renderedArea = this.element.querySelector(
      ".rendered-markdown",
    ) as HTMLElement;
    if (renderedArea) {
      renderedArea.innerHTML = notebookxMarkdownRender(renderedArea.innerText);
    }
  }

  execute() {}
}
