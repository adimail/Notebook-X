export interface CellOutput {
  name?: string;
  output_type: string;
  text?: string[];
  [key: string]: any;
  data?: Record<string, any>;
  execution_count?: number;
  metadata?: Record<string, any>;
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
