import { CodeCell } from "@/cells/code";
import { MarkdownCell } from "@/cells/markdown";

/**
 * Sets up all event listeners required for notebook functionality.
 * - Handles code execution for code cells.
 * - Initializes markdown cells.
 * - Shows/hides toolbars on cell hover.
 * - Adjusts textarea height dynamically.
 */
export function setupEventListeners() {
  // Code cell execution event
  document.querySelectorAll(".code-cell .run-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cellElement = (btn as HTMLElement).closest(".cell") as HTMLElement;
      new CodeCell(cellElement).execute();
    });
  });

  // Initialize Markdown cells
  document.querySelectorAll(".markdown-cell").forEach((cell) => {
    new MarkdownCell(cell as HTMLElement);
  });

  // Show/hide toolbar on cell hover
  document.querySelectorAll(".cell-container").forEach((cell) => {
    if (!(cell instanceof HTMLElement)) return;

    const toolbar = cell.querySelector(".cell-toolbar") as HTMLElement | null;
    if (!toolbar) return;

    cell.addEventListener("mouseenter", () => {
      toolbar.style.opacity = "1";
    });

    cell.addEventListener("mouseleave", () => {
      toolbar.style.opacity = "0";
    });
  });

  // Auto-adjust textarea height on input
  document
    .querySelectorAll<HTMLTextAreaElement>(".input-code")
    .forEach((textarea) => {
      const adjustHeight = (el: HTMLTextAreaElement) => {
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight - 22}px`;
      };

      textarea.addEventListener("input", function () {
        adjustHeight(this as HTMLTextAreaElement);
      });

      adjustHeight(textarea);
    });
}
