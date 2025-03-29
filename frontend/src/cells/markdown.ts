import { Cell } from "./base";
import { notebookxMarkdownRender } from "@/notebook/render";

export class MarkdownCell extends Cell {
  constructor(element: HTMLElement) {
    super(element);
    this.renderMarkdown();
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
