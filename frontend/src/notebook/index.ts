import { setupEventListeners } from './events';
import { Notebook as RenderedNotebookData } from '@/types';
import { renderNotebook } from '@/notebook/render';
import { EditorView } from 'codemirror';
import { fetchNotebook } from '@/utils/api';
import { useNotebookStore } from '@/store';
import {
  updateDOMTextareaAutoResize,
  updateDOMSaveIndicator,
} from '@/utils/dom';

class Notebook {
  private saveIndicator: HTMLElement | null = null;
  private editorContainer: HTMLElement | null = null;
  private editors: Map<string, EditorView> = new Map();

  async initialize() {
    setupEventListeners();
    this.editorContainer = document.getElementById('editor-container');
    this.saveIndicator = document.getElementById('save-indicator');

    this.startKernel();

    // Subscribe to stagedChanges updates
    useNotebookStore.subscribe(
      (state) => state.stagedChanges,
      (stagedChanges) => {
        if (stagedChanges) {
          console.log('stagedChanges updated', stagedChanges);
          updateDOMSaveIndicator(this.saveIndicator);
        }
      }
    );

    // Subscribe to notebook updates
    useNotebookStore.subscribe(
      (state) => state.notebook,
      (notebook) => {
        if (notebook) {
          console.log('notebook updated', notebook);
          this.render(notebook);
        }
      }
    );
  }

  async startKernel() {
    try {
      const response = await fetch('/api/kernel', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`Failed to start kernel: ${response.status}`);
      }
      const data = await response.json();
      const kernelId = data.kernel_id;
      useNotebookStore.getState().setKernelId(kernelId);
    } catch (error) {
      console.error('Error starting kernel:', error);
    }
  }

  async shutdownKernel() {
    const kernelId = useNotebookStore.getState().kernelId;
    if (!kernelId) return;

    try {
      const response = await fetch(`/api/kernel?kernel_id=${kernelId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to shut down kernel: ${response.status}`);
      }
      useNotebookStore.getState().setKernelId(null);
    } catch (error) {
      console.error('Error shutting down kernel:', error);
    }
  }

  async loadAndRender() {
    const path: string = window.location.pathname.replace('/notebook/', '');
    try {
      const notebookData: RenderedNotebookData = await fetchNotebook(path);

      useNotebookStore.getState().setNotebook(notebookData);
    } catch (error) {
      console.error('Error loading notebook:', error);
    }
  }

  render(notebookData: RenderedNotebookData) {
    if (!this.editorContainer) return;

    renderNotebook(notebookData, this.editorContainer, this.editors);

    updateDOMSaveIndicator(this.saveIndicator);

    updateDOMTextareaAutoResize();
  }
}

export { Notebook };
