import { Notebook as RenderedNotebookData } from "@/types";

export async function sendCodeExecutionRequest(code: string): Promise<any> {
  try {
    const response = await fetch("/kernel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

export async function fetchNotebook(
  path: string,
): Promise<RenderedNotebookData> {
  const response = await fetch(
    `/api/load_notebook?path=${encodeURIComponent(path)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load notebook");
  }

  const data = await response.json();
  return data as RenderedNotebookData;
}
