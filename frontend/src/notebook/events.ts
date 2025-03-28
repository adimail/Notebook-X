import { CodeCell } from "@/cells/code";

export function setupEventListeners() {
  document.querySelectorAll(".code-cell .run-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cellElement = (btn as HTMLElement).closest(".cell") as HTMLElement;
      new CodeCell(cellElement).execute();
    });
  });
}
