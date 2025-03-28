import "@/styles/index.css";

document.addEventListener("DOMContentLoaded", async () => {
  const py_v = document.getElementById("python-version");
  const pip_v = document.getElementById("pip-version");
  if (!py_v || !pip_v) {
    return;
  }
  try {
    const response = await fetch("/api/packages");
    const data = await response.json();
    py_v.textContent = data.python_version;
    pip_v.textContent = data.pip_version;
  } catch (error) {
    console.error("Error fetching version info:", error);
    py_v.textContent = "Python: error";
    pip_v.textContent = "pip: error";
  }
});
