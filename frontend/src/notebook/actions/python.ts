import { CodeCell } from "@/cells/code";

export function runCodeCell(cellElement: HTMLElement) {
  new CodeCell(cellElement).execute();
}
