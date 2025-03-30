export interface CellOutput {
  output_type: "stream" | "execute_result" | "display_data" | "error";
  name?: string; // For "stream" output (e.g., "stdout" or "stderr")
  text?: string[]; // For "stream" output
  execution_count?: number; // For "execute_result"

  // Used in "execute_result" and "display_data"
  data?: {
    "text/plain"?: string;
    "text/html"?: string;
    "image/png"?: string;
    "image/jpeg"?: string;
    "application/javascript"?: string;
    "application/json"?: string;
    "text/markdown"?: string;
    [key: string]: any; // Allow other MIME types
  };
  metadata?: Record<string, any>; // Metadata (e.g., image size, format, etc.)

  // Used in "error"
  ename?: string; // Exception name
  evalue?: string; // Exception message
  traceback?: string[]; // Stack trace
}

export interface NotebookCell {
  cell_type: "code" | "markdown";
  execution_count?: number | null;
  id: string;
  metadata: Record<string, any>;
  outputs?: CellOutput[];
  source: string;
  last_modified?: number;
}

export interface Notebook {
  cells: NotebookCell[];
  nbformat: number;
  nbformat_minor: number;
}

export interface DirectoryItem {
  name: string;
  isDir: boolean;
  size?: number;
  lastModified?: number;
  type?: string;
  children?: DirectoryItem[];
}

/**
 * Represents the real-time state of the notebook in the frontend.
 */
export interface NotebookState {
  notebook: Notebook;
  activeCellId?: string;
  unsavedChanges: boolean;
}
