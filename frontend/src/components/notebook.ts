function notebookxMarkdownRender(mdText: string): string {
  return mdText;
}

function updateOutputVisibility(cell: HTMLElement): void {
  const outputArea = cell.querySelector(".output-area") as HTMLElement;
  const outputCode = cell.querySelector(".output-code") as HTMLElement;
  if (outputCode && outputArea) {
    if (!outputCode.textContent || !outputCode.textContent.trim()) {
      outputArea.style.display = "none";
    } else {
      outputArea.style.display = "block";
    }
  }
}

function simulateExecution(): string {
  return Math.random() > 0.5 ? "Simulated output here." : "";
}

document.addEventListener("DOMContentLoaded", () => {
  const codeCells = document.querySelectorAll(".code-cell");
  codeCells.forEach((cell) => {
    updateOutputVisibility(cell as HTMLElement);
  });

  const runButtons = document.querySelectorAll(".code-cell .run-btn");
  runButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cell = (btn as HTMLElement).closest(".cell") as HTMLElement;
      if (!cell) return;
      const outputArea = cell.querySelector(".output-area") as HTMLElement;
      const outputCode = cell.querySelector(".output-code") as HTMLElement;
      if (!outputArea || !outputCode) return;

      const output = simulateExecution();
      outputCode.textContent = output;

      updateOutputVisibility(cell);
    });
  });

  const markdownCells = document.querySelectorAll(".markdown-cell");
  markdownCells.forEach((cell) => {
    const editBtn = cell.querySelector(
      ".edit-markdown-btn",
    ) as HTMLButtonElement;
    const renderedArea = cell.querySelector(
      ".rendered-markdown",
    ) as HTMLElement;
    const editorArea = cell.querySelector(
      ".markdown-editor",
    ) as HTMLTextAreaElement;

    if (!editBtn || !renderedArea || !editorArea) return;

    editorArea.style.display = "none";

    editBtn.addEventListener("click", () => {
      if (editorArea.style.display === "none") {
        // Switch to "edit mode"
        editorArea.value = renderedArea.innerText.trim();
        editorArea.style.display = "block";
        renderedArea.style.display = "none";
        editBtn.textContent = "Save";
      } else {
        // Switch to "rendered mode"
        const newMD = editorArea.value;
        const rendered = notebookxMarkdownRender(newMD);
        renderedArea.innerHTML = rendered;
        editorArea.style.display = "none";
        renderedArea.style.display = "block";
        editBtn.textContent = "Edit";
      }
    });
  });

  // Move up logic
  const moveUpButtons = document.querySelectorAll(".move-up-btn");
  moveUpButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cell = (btn as HTMLElement).closest(".cell");
      if (cell && cell.previousElementSibling) {
        cell.parentNode?.insertBefore(cell, cell.previousElementSibling);
      }
    });
  });

  // Move down logic
  const moveDownButtons = document.querySelectorAll(".move-down-btn");
  moveDownButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cell = (btn as HTMLElement).closest(".cell");
      if (cell && cell.nextElementSibling) {
        cell.parentNode?.insertBefore(cell.nextElementSibling, cell);
      }
    });
  });

  // Duplicate logic
  const duplicateButtons = document.querySelectorAll(".duplicate-btn");
  duplicateButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cell = (btn as HTMLElement).closest(".cell");
      if (cell) {
        const clone = cell.cloneNode(true) as HTMLElement;
        cell.parentNode?.insertBefore(clone, cell.nextSibling);
        // Ensure the new cell's output area visibility is updated
        updateOutputVisibility(clone);
      }
    });
  });

  // Delete logic
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cell = (btn as HTMLElement).closest(".cell");
      if (cell) {
        cell.remove();
      }
    });
  });
});
