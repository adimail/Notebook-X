import { MarkdownCell } from "@/cells/markdown";
import {
  runCodeCell,
  deleteCell,
  moveCellUp,
  moveCellDown,
  duplicateCell,
  toggleMarkdownEdit,
  saveNotebook,
  undoAction,
  resetNotebook,
  createNewCell,
} from "./actions";

/**
 * Sets up all event listeners required for notebook functionality.
 */
export function setupEventListeners() {
  document.querySelectorAll(".code-cell .run-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cellElement = (btn as HTMLElement).closest(".cell") as HTMLElement;
      runCodeCell(cellElement);
    });
  });

  document.querySelectorAll(".markdown-cell").forEach((cell) => {
    new MarkdownCell(cell as HTMLElement);
  });

  document.querySelectorAll(".cell-container").forEach((cell) => {
    if (!(cell instanceof HTMLElement)) return;

    const toolbar = cell.querySelector(".cell-toolbar") as HTMLElement | null;
    if (!toolbar) return;

    cell.addEventListener("mouseenter", () => (toolbar.style.opacity = "1"));
    cell.addEventListener("mouseleave", () => (toolbar.style.opacity = "0"));
  });

  document
    .querySelectorAll<HTMLTextAreaElement>(".input-code")
    .forEach((textarea) => {
      const adjustHeight = (el: HTMLTextAreaElement) => {
        const lineCount = el.value.split("\n").length;
        const computedStyle = window.getComputedStyle(el);
        let lineHeight = parseFloat(computedStyle.lineHeight);
        if (isNaN(lineHeight)) {
          lineHeight = 1.4 * parseFloat(computedStyle.fontSize);
        }
        el.style.height = `${lineCount * lineHeight}px`;
      };

      textarea.addEventListener("input", () => adjustHeight(textarea));
      adjustHeight(textarea);
    });

  document
    .getElementById("save-button")
    ?.addEventListener("click", saveNotebook);
  document.getElementById("undo-button")?.addEventListener("click", undoAction);
  document
    .getElementById("reset-button")
    ?.addEventListener("click", resetNotebook);
  document
    .getElementById("new-cell-button")
    ?.addEventListener("click", createNewCell);

  document.querySelectorAll(".run-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const cellElement = (button as HTMLElement).closest(
        ".cell",
      ) as HTMLElement;
      runCodeCell(cellElement);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const cellElement = (button as HTMLElement).closest(
        ".cell",
      ) as HTMLElement;
      deleteCell(cellElement);
    });
  });

  document.querySelectorAll(".move-up-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const cellElement = (button as HTMLElement).closest(
        ".cell",
      ) as HTMLElement;
      moveCellUp(cellElement);
    });
  });

  document.querySelectorAll(".move-down-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const cellElement = (button as HTMLElement).closest(
        ".cell",
      ) as HTMLElement;
      moveCellDown(cellElement);
    });
  });

  document.querySelectorAll(".duplicate-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const cellElement = (button as HTMLElement).closest(
        ".cell",
      ) as HTMLElement;
      duplicateCell(cellElement);
    });
  });

  document.querySelectorAll(".edit-markdown-btn").forEach((button) => {
    if (!(button instanceof HTMLElement)) return;

    button.addEventListener("click", () => {
      const cellElement = button.closest(".cell-container");
      if (!(cellElement instanceof HTMLElement)) {
        console.error(
          "No parent .cell-container found for markdown edit button",
        );
        return;
      }
      toggleMarkdownEdit(cellElement);
    });
  });

  // Save indicator
  // Save indicator logic
  const editorContainer = document.getElementById(
    "editor-container",
  ) as HTMLElement;
  const saveIndicator = document.getElementById(
    "save-indicator",
  ) as HTMLElement;

  let originalContent: string[] = [];

  function updateSaveIndicator(saved: boolean) {
    saveIndicator.classList.toggle("saved", saved);
    saveIndicator.classList.toggle("unsaved", !saved);
  }

  function storeOriginalContent() {
    originalContent = Array.from(
      editorContainer.querySelectorAll("textarea"),
    ).map((textarea) => (textarea as HTMLTextAreaElement).value);
    updateSaveIndicator(true);
  }

  function checkForChanges() {
    const currentContent = Array.from(
      editorContainer.querySelectorAll("textarea"),
    ).map((textarea) => (textarea as HTMLTextAreaElement).value);
    const isSaved =
      JSON.stringify(originalContent) === JSON.stringify(currentContent);
    updateSaveIndicator(isSaved);
  }

  function attachEventListeners() {
    document.querySelectorAll("textarea").forEach((textarea) => {
      textarea.addEventListener("input", checkForChanges);
    });
  }

  storeOriginalContent();
  attachEventListeners();
}
