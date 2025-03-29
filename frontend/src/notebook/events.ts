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

  document.body.addEventListener("dblclick", (event) => {
    const target = event.target as HTMLElement;
    const markdownContainer = target.closest(
      ".rendered-markdown",
    ) as HTMLElement;

    if (markdownContainer) {
      const cell = markdownContainer.closest(".cell-container") as HTMLElement;
      if (cell) toggleMarkdownEdit(cell);
    }
  });
}
