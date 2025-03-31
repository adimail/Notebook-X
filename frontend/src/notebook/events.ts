import { setupShortcuts } from "./shortcuts";
import { useNotebookStore } from "@/store";
import {
  runCodeCell,
  deleteCell,
  moveCellUp,
  moveCellDown,
  duplicateCell,
  toggleMarkdownEdit,
  saveNotebook,
  createCell,
} from "@/notebook/actions";

export function setupEventListeners() {
  setupCellHoverEffects();
  setupGlobalButtonActions();
  setupCellToolbarActions();
  setupMarkdownDoubleClick();
  setupShortcuts();
  navigationEventListners();
}

function navigationEventListners() {
  const hasUnsavedChanges = () =>
    JSON.stringify(useNotebookStore.getState().notebook) !==
    JSON.stringify(useNotebookStore.getState().stagedChanges);

  const confirmNavigation = (event?: Event) => {
    if (!hasUnsavedChanges()) return;
    event?.preventDefault();
    return confirm("You have unsaved changes. Are you sure you want to leave?");
  };

  window.addEventListener(
    "beforeunload",
    (event) => confirmNavigation(event) && (event.returnValue = ""),
  );
  window.addEventListener(
    "popstate",
    (event) =>
      !confirmNavigation(event) && history.pushState(null, "", location.href),
  );
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
    "new-code-cell-btn": () => createCell("code"),
    "new-markdown-cell-btn": () => createCell("markdown"),
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

    const cellId = cell.id;
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
      toggleMarkdownEdit(cell.id);
    }
  });
}
