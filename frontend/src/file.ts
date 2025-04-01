document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("file-editor") as HTMLTextAreaElement;
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
});
