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
  saved: boolean,
): void {
  if (!saveIndicator) return;
  saveIndicator.classList.toggle("saved", saved);
  saveIndicator.classList.toggle("unsaved", !saved);
}

function storeOriginalContent(
  editorContainer: HTMLElement | null,
  saveIndicator: HTMLElement | null,
): string[] {
  if (!editorContainer) return [];
  const originalContent = Array.from(
    editorContainer.querySelectorAll("textarea"),
  ).map((textarea) => (textarea as HTMLTextAreaElement).value);
  updateSaveIndicator(saveIndicator, true);
  return originalContent;
}

function checkForChanges(
  editorContainer: HTMLElement | null,
  originalContent: string[],
  saveIndicator: HTMLElement | null,
): void {
  if (!editorContainer) return;
  const currentContent = Array.from(
    editorContainer.querySelectorAll("textarea"),
  ).map((textarea) => (textarea as HTMLTextAreaElement).value);
  const isSaved =
    JSON.stringify(originalContent) === JSON.stringify(currentContent);
  updateSaveIndicator(saveIndicator, isSaved);
}

export function updateDOMSaveIndicator(
  editorContainer: HTMLElement | null,
  saveIndicator: HTMLElement | null,
  originalContent: string[],
): void {
  if (!editorContainer) return;

  originalContent = storeOriginalContent(editorContainer, saveIndicator);

  editorContainer.querySelectorAll("textarea").forEach((textarea) => {
    textarea.addEventListener("input", () =>
      checkForChanges(editorContainer, originalContent, saveIndicator),
    );
  });
}
