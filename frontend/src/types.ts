// types.ts
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
  source: string[];
  last_modified?: number;
}

export interface KernelSpec {
  display_name: string;
  language: string;
  name: string;
}

export interface LanguageInfo {
  codemirror_mode: {
    name: string;
    version?: number;
  };
  file_extension: string;
  mimetype: string;
  name: string;
  nbconvert_exporter: string;
  pygments_lexer: string;
  version: string;
}

export interface NotebookMetadata {
  kernelspec: KernelSpec;
  language_info: LanguageInfo;
  [key: string]: any;
}

export interface Notebook {
  cells: NotebookCell[];
  metadata: NotebookMetadata;
  nbformat: number;
  nbformat_minor: number;
}

export interface RenderedNotebookData extends Notebook {
  current_path: string;
  title: string;
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
