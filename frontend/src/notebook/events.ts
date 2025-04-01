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
  setupNavigationListeners();
}

function setupNavigationListeners() {
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
  document.body.addEventListener("mouseover", toggleCellToolbarOpacity(1));
  document.body.addEventListener("mouseout", toggleCellToolbarOpacity(0));
}

const toggleCellToolbarOpacity = (opacity: number) => (event: Event) => {
  const toolbar = (event.target as HTMLElement)
    .closest(".cell-container")
    ?.querySelector(".cell-toolbar") as HTMLElement;
  if (toolbar) toolbar.style.opacity = opacity.toString();
};

function setupGlobalButtonActions() {
  Object.entries({
    "save-button": saveNotebook,
    "new-code-cell-btn": () => createCell("code"),
    "new-markdown-cell-btn": () => createCell("markdown"),
  }).forEach(([id, handler]) =>
    document.getElementById(id)?.addEventListener("click", handler),
  );
}

function setupCellToolbarActions() {
  document.body.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const cell = target.closest(".cell-container");
    const cellId = cell?.id;
    if (!cellId) return;

    const actions: Record<string, (cellId: string) => void> = {
      "run-btn": runCodeCell,
      "delete-btn": deleteCell,
      "move-up-btn": moveCellUp,
      "move-down-btn": moveCellDown,
      "duplicate-btn": duplicateCell,
      "edit-markdown-btn": toggleMarkdownEdit,
    };

    const action = Object.entries(actions).find(([selector]) =>
      target.matches(`.${selector}`),
    )?.[1];
    if (action) action(cellId);
  });
}

function setupMarkdownDoubleClick() {
  document.body.addEventListener("dblclick", (event) => {
    const cell = (event.target as HTMLElement).closest(".cell-container");
    if (cell?.id) toggleMarkdownEdit(cell.id);
  });
}
