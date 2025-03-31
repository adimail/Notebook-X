export { sendCodeExecutionRequest } from "@/utils/api";
export { updateOutputVisibility } from "@/utils/dom";

export function generateCellId(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
