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
  document.querySelectorAll(".markdown-cell").forEach((cell) => {
    new MarkdownCell(cell as HTMLElement);
  });

  // =========================================================
  //
  // Input cell UI logic
  //
  // =========================================================
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

  // =========================================================
  //
  // Cell container toolbar
  //
  // Run, Edit/save (markdown), Move up, Move down, Duplicate, Delete
  //
  // =========================================================

  document.body.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    if (target.matches(".run-btn")) {
      const cell = target.closest(".cell-container") as HTMLElement;
      if (cell) runCodeCell(cell);
    }

    if (target.matches(".delete-btn")) {
      const cell = target.closest(".cell-container") as HTMLElement;
      if (cell) deleteCell(cell);
    }

    if (target.matches(".move-up-btn")) {
      const cell = target.closest(".cell-container") as HTMLElement;
      if (cell) moveCellUp(cell);
    }

    if (target.matches(".move-down-btn")) {
      const cell = target.closest(".cell-container") as HTMLElement;
      if (cell) moveCellDown(cell);
    }

    if (target.matches(".duplicate-btn")) {
      const cell = target.closest(".cell-container") as HTMLElement;
      if (cell) duplicateCell(cell);
    }

    if (target.matches(".edit-markdown-btn")) {
      const cell = target.closest(".cell-container") as HTMLElement;
      if (cell) toggleMarkdownEdit(cell);
    }
  });

  // =========================================================
  //
  // Save indicator logic
  //
  // =========================================================

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

  storeOriginalContent();

  document.querySelectorAll("textarea").forEach((textarea) => {
    textarea.addEventListener("input", checkForChanges);
  });
}
