import { setupEventListeners } from "./events";

class Notebook {
  private kernelId: string | null = null;

  async initialize() {
    await this.fetchKernelId();
    setupEventListeners();
  }

  private async fetchKernelId() {
    try {
      const response = await fetch("/kernel");
      const data = await response.json();
      this.kernelId = data.kernel_id;
    } catch (error) {
      console.error("Error fetching kernel id:", error);
    }
  }
}

export { Notebook };
