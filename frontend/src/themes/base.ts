import { EditorView } from "@codemirror/view";

export const baseConfig = EditorView.theme({
  "&": {
    color: "#ebdbb2",
    backgroundColor: "#282828",
  },
  ".cm-content": {
    caretColor: "#fe8019",
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#fe8019",
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "#3c3836",
  },
  ".cm-gutters": {
    backgroundColor: "#282828",
    color: "#a89984",
    border: "none",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    color: "#a89984",
    fontSize: "13px",
    padding: "0 8px",
  },
  ".cm-tooltip": {
    backgroundColor: "#3c3836",
    color: "#ebdbb2",
    border: "1px solid #504945",
  },
  ".cm-tooltip-autocomplete": {
    backgroundColor: "#3c3836",
    border: "1px solid #504945",
    color: "#ebdbb2",
    fontSize: "13px",
  },
  ".cm-tooltip-autocomplete > ul > li": {
    padding: "4px 10px",
  },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "#504945",
    color: "#fabd2f",
  },
  ".cm-activeLine": { backgroundColor: "rgba(60, 56, 54, 0.6)" },
  ".cm-gutterElement": { backgroundColor: "#282828", color: "#a89984" },
});
