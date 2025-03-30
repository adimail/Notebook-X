import { useNotebookStore } from "@/store";

export function updateOutputVisibility(cell: HTMLElement): void {
  const outputArea = cell.querySelector(".output-area") as HTMLElement;
  const outputCode = cell.querySelector(".output-code") as HTMLElement;
  outputArea.style.display = outputCode?.textContent?.trim() ? "block" : "none";
}

export function updateDOMTextareaAutoResize(): void {
  document
    .querySelectorAll<HTMLTextAreaElement>(".input-code")
    .forEach((textarea) => {
      const adjustHeight = (el: HTMLTextAreaElement) => {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      };

      const adjustOnChange = () => {
        requestAnimationFrame(() => {
          setTimeout(() => adjustHeight(textarea), 0);
        });
      };

      textarea.addEventListener("input", adjustOnChange);
      textarea.addEventListener("focus", adjustOnChange);
      textarea.addEventListener("paste", adjustOnChange);

      adjustHeight(textarea);
    });
}

// =========================================================
//
// Save indicator logic
//
// =========================================================

function updateSaveIndicator(
  saveIndicator: HTMLElement | null,
  isSaved: boolean,
): void {
  if (!saveIndicator) return;
  saveIndicator.classList.toggle("saved", isSaved);
  saveIndicator.classList.toggle("unsaved", !isSaved);
}

export function updateDOMSaveIndicator(
  saveIndicator: HTMLElement | null,
): void {
  if (!saveIndicator) return;

  useNotebookStore.subscribe((state) => {
    const isSaved =
      JSON.stringify(state.notebook) === JSON.stringify(state.stagedChanges);
    updateSaveIndicator(saveIndicator, isSaved);
  });
}
