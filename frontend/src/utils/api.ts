import { Notebook as RenderedNotebookData, ExecutionResults } from "@/types";

let socket: WebSocket | null = null;
let executionCallbacks: Map<string, (result: ExecutionResults) => void> =
  new Map();
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

export function initializeWebSocket(): Promise<void> {
  if (isConnected && socket) {
    return Promise.resolve();
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = new Promise((resolve, reject) => {
    socket = new WebSocket("ws://localhost:8197/ws");

    socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
      isConnected = true;
      connectionPromise = null;
      resolve();
    });

    socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.execution_count !== undefined) {
          const requestId = message.requestId || "default";
          const callback = executionCallbacks.get(requestId);

          if (callback) {
            callback(message as ExecutionResults);
            executionCallbacks.delete(requestId);
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      isConnected = false;
      connectionPromise = null;
      reject(error);
    });

    socket.addEventListener("close", () => {
      console.log("WebSocket connection closed");
      isConnected = false;
      connectionPromise = null;
    });
  });

  return connectionPromise;
}

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeout = 10000,
): Promise<Response> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), timeout),
  );

  return Promise.race([
    fetch(url, options),
    timeoutPromise,
  ]) as Promise<Response>;
};

export async function sendCodeExecutionRequest(
  kernelId: string,
  code: string,
): Promise<ExecutionResults> {
  await initializeWebSocket();

  return new Promise((resolve, reject) => {
    try {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket connection not open");
      }

      const requestId = `exec_${Date.now()}_${Math.random().toString(36)}`;

      executionCallbacks.set(requestId, resolve);

      const timeout = setTimeout(() => {
        executionCallbacks.delete(requestId);
        reject(new Error("Code execution request timed out"));
      }, 30000);

      socket.send(
        JSON.stringify({
          type: "execute_code",
          kernel_id: kernelId,
          code,
          requestId,
        }),
      );

      const originalResolve = resolve;
      executionCallbacks.set(requestId, (result) => {
        clearTimeout(timeout);
        originalResolve(result);
      });
    } catch (error: any) {
      reject(
        new Error(`Error sending code execution request: ${error.message}`),
      );
    }
  });
}

export async function fetchNotebook(
  path: string,
): Promise<RenderedNotebookData> {
  try {
    const response = await fetchWithTimeout(
      `/api/load_notebook?path=${encodeURIComponent(path)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to load notebook: ${errorText}`);
    }

    const data = await response.json();
    return data as RenderedNotebookData;
  } catch (error: any) {
    throw new Error(`Error fetching notebook: ${error.message}`);
  }
}

export const saveNotebookInFileSystem = async (
  notebook: RenderedNotebookData | null,
): Promise<void> => {
  if (!notebook) {
    console.warn("No notebook data to save.");
    return;
  }

  try {
    const urlParts = window.location;
    const filename = urlParts.pathname.replace("/notebook/", "");

    const response = await fetchWithTimeout("/api/save-notebook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notebook,
        path: filename,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save notebook: ${errorText}`);
    }

    console.log("Notebook successfully saved:", await response.json());
  } catch (error: any) {
    console.error("Error saving notebook:", error);
  }
};
