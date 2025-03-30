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
} from "@/notebook/actions";

export function setupEventListeners() {
  setupCellHoverEffects();
  setupGlobalButtonActions();
  setupCellToolbarActions();
  setupMarkdownDoubleClick();
}

function setupCellHoverEffects() {
  document.body.addEventListener("mouseover", (event) => {
    const cell = (event.target as HTMLElement).closest(".cell-container");
    if (!cell) return;

    const toolbar = cell.querySelector(".cell-toolbar") as HTMLElement | null;
    if (toolbar) toolbar.style.opacity = "1";
  });

  document.body.addEventListener("mouseout", (event) => {
    const cell = (event.target as HTMLElement).closest(".cell-container");
    if (!cell) return;

    const toolbar = cell.querySelector(".cell-toolbar") as HTMLElement | null;
    if (toolbar) toolbar.style.opacity = "0";
  });
}

function setupGlobalButtonActions() {
  const buttonActions: { [key: string]: () => void } = {
    "save-button": saveNotebook,
    "undo-button": undoAction,
    "reset-button": resetNotebook,
    "new-cell-button": createNewCell,
  };

  Object.entries(buttonActions).forEach(([id, handler]) => {
    document.getElementById(id)?.addEventListener("click", handler);
  });
}

function setupCellToolbarActions() {
  document.body.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;

    let cell = target.parentElement;
    while (cell && !cell.classList.contains("cell-container")) {
      cell = cell.parentElement;
    }

    if (!cell) return;

    const cellId = cell.id.replace("cell-", "");
    if (!cellId) return;

    const actions: { [key: string]: (cellId: string) => void } = {
      "run-btn": runCodeCell,
      "delete-btn": deleteCell,
      "move-up-btn": moveCellUp,
      "move-down-btn": moveCellDown,
      "duplicate-btn": duplicateCell,
      "edit-markdown-btn": toggleMarkdownEdit,
    };

    for (const [selector, action] of Object.entries(actions)) {
      if (target.matches(`.${selector}`)) {
        action(cellId);
        break;
      }
    }
  });
}

function setupMarkdownDoubleClick() {
  document.body.addEventListener("dblclick", (event) => {
    const target = event.target as HTMLElement;

    let markdownContainer = target.parentElement;
    while (
      markdownContainer &&
      !markdownContainer.classList.contains("rendered-markdown")
    ) {
      markdownContainer = markdownContainer.parentElement;
    }

    if (!markdownContainer) return;

    let cell = markdownContainer.parentElement;
    while (cell && !cell.classList.contains("cell-container")) {
      cell = cell.parentElement;
    }

    if (cell && cell.id) {
      const cellId = cell.id.replace("cell-", "");
      toggleMarkdownEdit(cellId);
    }
  });
}
