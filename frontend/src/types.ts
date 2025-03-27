export interface CellOutput {
  name?: string;
  output_type: string;
  text?: string[];
  [key: string]: any;
}

export interface NotebookCell {
  cell_type: "code" | "markdown";
  execution_count?: number | null;
  id: string;
  metadata: Record<string, any>;
  outputs?: CellOutput[];
  source: string[];
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

export interface DirectoryItem {
  name: string;
  isDir: boolean;
  children?: DirectoryItem[];
}
