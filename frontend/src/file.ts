document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("file-editor") as HTMLTextAreaElement;
  const saveButton = document.getElementById(
    "save-button",
  ) as HTMLButtonElement;
  const undoButton = document.getElementById(
    "undo-button",
  ) as HTMLButtonElement;
  const resetButton = document.getElementById(
    "reset-button",
  ) as HTMLButtonElement;
  const saveIndicator = document.getElementById(
    "save-indicator",
  ) as HTMLElement;

  let originalContent = editor.value;

  function updateSaveIndicator(saved: boolean) {
    saveIndicator.classList.toggle("saved", saved);
    saveIndicator.classList.toggle("unsaved", !saved);
  }

  editor.addEventListener("input", () =>
    updateSaveIndicator(editor.value === originalContent),
  );

  saveButton.addEventListener("click", async () => {
    const response = await fetch("/api/save_file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        content: editor.value,
      }),
    });
    const result = await response.json();
    if (result.success) {
      originalContent = editor.value;
      updateSaveIndicator(true);
    } else {
      alert("Error saving file: " + result.message);
    }
  });

  undoButton.addEventListener("click", () => {
    editor.value = originalContent;
    updateSaveIndicator(true);
  });

  resetButton.addEventListener("click", () => {
    editor.value = "";
    updateSaveIndicator(false);
  });
});
