export interface CellOutput {
  output_type: "stream" | "execute_result" | "display_data" | "error";
  name?: string;
  text?: string;
  execution_count?: number;
  data?: {
    "text/plain"?: string;
    "text/html"?: string;
    "image/png"?: string;
    "image/jpeg"?: string;
    "application/javascript"?: string;
    "application/json"?: string;
    "text/markdown"?: string;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
  ename?: string;
  evalue?: string;
  traceback?: string[];
}

export interface ExecutionResults {
  execution_count?: number;
  outputs: CellOutput[];
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
