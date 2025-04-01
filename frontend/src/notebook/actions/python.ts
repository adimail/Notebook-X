import { CodeCell } from "@/cells/code";

export function runCodeCell(cellId: string) {
  const cellElement = document.getElementById(cellId);
  if (cellElement) new CodeCell(cellElement).execute();
}
