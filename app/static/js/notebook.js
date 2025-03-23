document.addEventListener("DOMContentLoaded", function () {
  const notebookContainer = document.getElementById("notebook-container");
  const saveButton = document.getElementById("save-btn");
  const addCellButton = document.getElementById("add-cell-btn");
  const runAllButton = document.getElementById("run-all-btn");

  let notebookData = null;
  let kernelId = null;

  // Load the notebook content
  fetch(`/api/files/content?path=${encodeURIComponent(filename)}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }

      notebookData = data.content;

      // Create a kernel for this notebook
      return fetch("/api/kernel/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
    })
    .then((response) => response.json())
    .then((data) => {
      kernelId = data.kernel_id;
      renderNotebook();
    })
    .catch((error) => {
      console.error("Error loading notebook:", error);
      alert("Failed to load notebook");
    });

  // Save the notebook
  saveButton.addEventListener("click", saveNotebook);

  // Add a new cell
  addCellButton.addEventListener("click", () => {
    const newCell = {
      cell_type: "code",
      execution_count: null,
      metadata: {},
      source: "",
      outputs: [],
    };

    if (!notebookData.cells) {
      notebookData.cells = [];
    }

    notebookData.cells.push(newCell);
    renderNotebook();
  });

  // Run all cells
  runAllButton.addEventListener("click", () => {
    const cells = document.querySelectorAll(".cell");
    let cellIndex = 0;

    function runNextCell() {
      if (cellIndex < cells.length) {
        const cell = cells[cellIndex];
        const runButton = cell.querySelector(".run-cell");
        if (runButton) {
          runButton.click();
          // Wait for cell execution to complete before running the next cell
          setTimeout(() => {
            cellIndex++;
            runNextCell();
          }, 500);
        } else {
          cellIndex++;
          runNextCell();
        }
      }
    }

    runNextCell();
  });

  function renderNotebook() {
    notebookContainer.innerHTML = "";

    if (!notebookData || !notebookData.cells) {
      // Create a default notebook structure if the file is empty or new
      notebookData = {
        cells: [],
        metadata: {
          kernelspec: {
            display_name: "Python 3",
            language: "python",
            name: "python3",
          },
          language_info: {
            name: "python",
            version: "3.8",
          },
        },
        nbformat: 4,
        nbformat_minor: 5,
      };

      // Add an initial cell
      notebookData.cells.push({
        cell_type: "code",
        execution_count: null,
        metadata: {},
        source: "",
        outputs: [],
      });
    }

    // Render each cell
    notebookData.cells.forEach((cell, index) => {
      const cellElement = document.createElement("div");
      cellElement.className = "cell";
      cellElement.id = `cell-${index}`;

      // Cell toolbar
      const cellToolbar = document.createElement("div");
      cellToolbar.className = "cell-toolbar";

      const cellType = document.createElement("select");
      cellType.className = "cell-type";
      ["code", "markdown"].forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        option.selected = cell.cell_type === type;
        cellType.appendChild(option);
      });
      cellType.addEventListener("change", (event) => {
        cell.cell_type = event.target.value;
        renderNotebook();
      });

      const runButton = document.createElement("button");
      runButton.className = "run-cell";
      runButton.textContent = "Run";
      runButton.addEventListener("click", () => {
        if (cell.cell_type === "code") {
          runCell(index);
        } else if (cell.cell_type === "markdown") {
          renderMarkdown(index);
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-cell";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        notebookData.cells.splice(index, 1);
        renderNotebook();
      });

      const executionCount = document.createElement("div");
      executionCount.className = "execution-count";
      executionCount.textContent = cell.execution_count || "0";

      cellToolbar.appendChild(executionCount);
      cellToolbar.appendChild(cellType);
      cellToolbar.appendChild(runButton);
      cellToolbar.appendChild(deleteButton);

      const cellContent = document.createElement("div");
      cellContent.className = "cell-content";

      const cellEditor = document.createElement("textarea");
      cellEditor.className = "cell-editor";
      const cellSource = Array.isArray(cell.source)
        ? cell.source.join("")
        : cell.source;

      cellEditor.rows = Math.max(
        Math.min(cellSource.split("\n").length, 20),
        3,
      );
      cellEditor.value = cellSource;
      cellEditor.addEventListener("input", (event) => {
        cell.source = event.target.value;
      });

      cellContent.appendChild(cellEditor);

      // Cell output (for code cells)
      const cellOutput = document.createElement("div");
      cellOutput.className = "cell-output";

      if (cell.outputs && cell.outputs.length > 0) {
        cell.outputs.forEach((output) => {
          if (
            output.output_type === "execute_result" ||
            output.output_type === "display_data"
          ) {
            const dataElement = document.createElement("pre");
            dataElement.className = "result-data";
            dataElement.textContent = output.data["text/plain"] || "";
            cellOutput.appendChild(dataElement);
          } else if (output.output_type === "stream") {
            const streamElement = document.createElement("pre");
            streamElement.className = output.name || "stdout";
            streamElement.textContent = Array.isArray(output.text)
              ? output.text.join("")
              : output.text;
            cellOutput.appendChild(streamElement);
          } else if (output.output_type === "error") {
            const errorElement = document.createElement("pre");
            errorElement.className = "error";
            errorElement.textContent = `${output.ename}: ${output.evalue}`;
            cellOutput.appendChild(errorElement);
          }
        });
      }

      // Assemble the cell
      cellElement.appendChild(cellToolbar);
      cellElement.appendChild(cellContent);
      cellElement.appendChild(cellOutput);

      notebookContainer.appendChild(cellElement);
    });
  }

  function runCell(cellIndex) {
    const cell = notebookData.cells[cellIndex];
    const code = Array.isArray(cell.source)
      ? cell.source.join("")
      : cell.source;
    const cellElement = document.getElementById(`cell-${cellIndex}`);
    const outputElement = cellElement.querySelector(".cell-output");

    // Clear the output
    outputElement.innerHTML = "";

    // Add a loading indicator
    const loadingElement = document.createElement("div");
    loadingElement.className = "loading";
    loadingElement.textContent = "Running...";
    outputElement.appendChild(loadingElement);

    // Execute the code
    fetch("/api/kernel/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kernel_id: kernelId,
        code: code,
        cell_id: cellIndex,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        // Clear the output again (to remove the loading indicator)
        outputElement.innerHTML = "";

        if (result.error) {
          outputElement.innerHTML = `<div class="error">${result.error}</div>`;
          return;
        }

        // Update execution count
        notebookData.cells[cellIndex].execution_count = result.execution_count;
        cellElement.querySelector(".execution-count").textContent =
          result.execution_count || "";

        // Display stdout
        if (result.stdout) {
          const stdoutElement = document.createElement("pre");
          stdoutElement.className = "stdout";
          stdoutElement.textContent = result.stdout;
          outputElement.appendChild(stdoutElement);
        }

        // Display stderr
        if (result.stderr) {
          const stderrElement = document.createElement("pre");
          stderrElement.className = "stderr";
          stderrElement.textContent = result.stderr;
          outputElement.appendChild(stderrElement);
        }

        // Display result data
        if (result.data) {
          const dataElement = document.createElement("pre");
          dataElement.className = "result-data";
          dataElement.textContent = result.data;
          outputElement.appendChild(dataElement);
        }

        // Save the outputs
        notebookData.cells[cellIndex].outputs = [
          {
            output_type: result.status === "ok" ? "execute_result" : "error",
            execution_count: result.execution_count,
            data: { "text/plain": result.data || "" },
            metadata: {},
          },
        ];

        if (result.stdout) {
          notebookData.cells[cellIndex].outputs.push({
            output_type: "stream",
            name: "stdout",
            text: result.stdout,
          });
        }

        if (result.stderr) {
          notebookData.cells[cellIndex].outputs.push({
            output_type: "stream",
            name: "stderr",
            text: result.stderr,
          });
        }

        if (result.status === "error") {
          notebookData.cells[cellIndex].outputs.push({
            output_type: "error",
            ename: result.ename || "Error",
            evalue: result.evalue || "Unknown error",
            traceback: [result.stderr || ""],
          });
        }
      })
      .catch((error) => {
        console.error("Error executing code:", error);
        outputElement.innerHTML = `<div class="error">Failed to execute code: ${error.message}</div>`;
      });
  }

  function renderMarkdown(cellIndex) {
    // Simple markdown rendering (just display the text for now)
    const cell = notebookData.cells[cellIndex];
    const cellElement = document.getElementById(`cell-${cellIndex}`);
    const outputElement = cellElement.querySelector(".cell-output");

    outputElement.innerHTML = "";
    const markdownElement = document.createElement("div");
    markdownElement.className = "markdown";
    markdownElement.textContent = Array.isArray(cell.source)
      ? cell.source.join("")
      : cell.source;
    outputElement.appendChild(markdownElement);
  }

  function saveNotebook() {
    fetch("/api/files/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: filename,
        content: notebookData,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(`Error: ${data.error}`);
        } else {
          alert("Notebook saved successfully");
        }
      })
      .catch((error) => {
        console.error("Error saving notebook:", error);
        alert("Failed to save notebook");
      });
  }
});
