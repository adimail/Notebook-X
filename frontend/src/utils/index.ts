export { sendCodeExecutionRequest } from "@/utils/api";
export { updateOutputVisibility } from "@/utils/dom";

export function generateCellId(): string {
  return `${Date.now()}_${Math.random().toString(36)}`;
}
