import { baseConfig } from "./base";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

export const gruvboxDarkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#fb4934" },
  { tag: tags.comment, color: "#928374" },
  { tag: tags.string, color: "#b8bb26" },
  { tag: tags.variableName, color: "#83a598" },
  { tag: tags.function(tags.variableName), color: "#fabd2f" },
  { tag: tags.operator, color: "#fe8019" },
  { tag: tags.number, color: "#d3869b" },
]);

export const gruvboxDark = [
  baseConfig,
  syntaxHighlighting(gruvboxDarkHighlightStyle),
];
