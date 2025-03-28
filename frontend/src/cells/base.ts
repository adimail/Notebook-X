export abstract class Cell {
  protected element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  abstract execute(): void;
}
