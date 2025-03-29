import { Parser, HtmlRenderer } from "commonmark";
import DOMPurify from "dompurify";

export function notebookxMarkdownRender(mdText: string): string {
  const reader = new Parser();
  const writer = new HtmlRenderer();
  const parsed = reader.parse(mdText);
  return DOMPurify.sanitize(writer.render(parsed));
}
