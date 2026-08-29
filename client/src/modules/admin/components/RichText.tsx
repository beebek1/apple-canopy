// ---------- Lightweight inline rich text for paragraph blocks ----------
// Paragraph text is stored with a tiny markdown-style syntax:
//   **bold**   *italic*   ~~strikethrough~~   [label](https://url)
//
// - applyInlineMark()   wraps/unwraps a selection with that syntax (kept
//   around in case you still need programmatic mark application anywhere).
// - parseInline() / <InlineText />  turn stored text into styled spans for
//   read-only rendering (article page, preview).
// - markdownToHtml() / htmlToMarkdown()  are the two new functions that let
//   the paragraph editor be a real contentEditable surface: markdownToHtml
//   renders the stored string as live HTML when a block is loaded/converted,
//   and htmlToMarkdown serializes the live DOM back to the stored string
//   after every edit.

import type { ReactNode } from "react";

export type InlineMark = "bold" | "italic" | "strike" | "link";

const WRAPPERS: Record<Exclude<InlineMark, "link">, string> = {
  bold: "**",
  italic: "*",
  strike: "~~",
};

export interface TextSelection {
  start: number;
  end: number;
}

// Wraps (or, if already wrapped, unwraps) the selected range of `value`
// with the marker for `mark`. Returns the new full text plus where the
// selection should land afterwards, so the caller can restore it.
export function applyInlineMark(
  value: string,
  selection: TextSelection,
  mark: InlineMark,
  linkUrl?: string
): { text: string; selection: TextSelection } {
  const { start, end } = selection;
  if (start === end) return { text: value, selection };
  const selected = value.slice(start, end);
  const before = value.slice(0, start);
  const after = value.slice(end);

  if (mark === "link") {
    const url = linkUrl?.trim();
    if (!url) return { text: value, selection };
    const inserted = `[${selected}](${url})`;
    return { text: before + inserted + after, selection: { start, end: start + inserted.length } };
  }

  const token = WRAPPERS[mark];
  const alreadyWrapped =
    selected.startsWith(token) && selected.endsWith(token) && selected.length >= token.length * 2;

  if (alreadyWrapped) {
    const unwrapped = selected.slice(token.length, selected.length - token.length);
    return { text: before + unwrapped + after, selection: { start, end: start + unwrapped.length } };
  }

  const wrapped = `${token}${selected}${token}`;
  return { text: before + wrapped + after, selection: { start, end: start + wrapped.length } };
}

interface InlineToken {
  key: string;
  kind: "text" | "bold" | "italic" | "strike" | "link";
  content: string;
  href?: string;
}

// Order matters: try the longest markers first so **bold** isn't parsed as
// two stray *italic* markers.
const INLINE_PATTERN = /(\*\*.+?\*\*|~~.+?~~|\*.+?\*|\[.+?\]\(.+?\))/g;

export function parseInline(text: string): InlineToken[] {
  const parts = text.split(INLINE_PATTERN).filter((p) => p !== "");
  const tokens: InlineToken[] = [];
  let i = 0;
  for (const part of parts) {
    const key = `t${i++}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      tokens.push({ key, kind: "bold", content: part.slice(2, -2) });
    } else if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      tokens.push({ key, kind: "strike", content: part.slice(2, -2) });
    } else if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      tokens.push({ key, kind: "italic", content: part.slice(1, -1) });
    } else {
      const linkMatch = /^\[(.+)\]\((.+)\)$/.exec(part);
      if (linkMatch) {
        tokens.push({ key, kind: "link", content: linkMatch[1], href: linkMatch[2] });
      } else {
        tokens.push({ key, kind: "text", content: part });
      }
    }
  }
  return tokens;
}

// Renders stored paragraph text (with the markers above) as real styled
// spans — used by the read-only article renderer and the preview.
export function InlineText({ text }: { text: string }): ReactNode {
  if (!text) return null;
  return (
    <>
      {parseInline(text).map((token) => {
        switch (token.kind) {
          case "bold":
            return <strong key={token.key}>{token.content}</strong>;
          case "italic":
            return <em key={token.key}>{token.content}</em>;
          case "strike":
            return <s key={token.key}>{token.content}</s>;
          case "link":
            return (
              <a
                key={token.key}
                href={token.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-1 underline-offset-2 text-[#11512a] hover:text-[#0c3a1e]"
              >
                {token.content}
              </a>
            );
          default:
            return <span key={token.key}>{token.content}</span>;
        }
      })}
    </>
  );
}

// ---------- contentEditable <-> markdown bridge ----------

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Converts stored markdown-style text into HTML so the contentEditable
// surface can display it live (so **bold** actually shows bold while
// editing, instead of the raw asterisks).
export function markdownToHtml(text: string): string {
  if (!text) return "";
  return parseInline(text)
    .map((token) => {
      const escaped = escapeHtml(token.content);
      switch (token.kind) {
        case "bold":
          return `<strong>${escaped}</strong>`;
        case "italic":
          return `<em>${escaped}</em>`;
        case "strike":
          return `<s>${escaped}</s>`;
        case "link":
          return `<a href="${escapeHtml(token.href ?? "")}" target="_blank" rel="noopener noreferrer" style="color:#11512a;text-decoration:underline;font-weight:600;cursor:pointer;">${escaped}</a>`;
        default:
          return escaped;
      }
    })
    .join("");
}

// Walks a contentEditable element's live DOM and serializes it back into
// the markdown-style string used for storage. Mirrors the tags produced by
// document.execCommand('bold' | 'italic' | 'strikeThrough' | 'createLink').
export function htmlToMarkdown(root: HTMLElement): string {
  function wrapFor(tag: string, content: string, href?: string): string {
    if (!content) return "";
    switch (tag) {
      case "B":
      case "STRONG":
        return `**${content}**`;
      case "I":
      case "EM":
        return `*${content}*`;
      case "S":
      case "STRIKE":
      case "DEL":
        return `~~${content}~~`;
      case "A":
        return `[${content}](${href ?? ""})`;
      default:
        return content;
    }
  }

  function serialize(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    if (el.tagName === "BR") return "\n";

    let inner = "";
    el.childNodes.forEach((child) => {
      inner += serialize(child);
    });

    // Some browsers wrap a fresh line in a <div>/<p> instead of <br> when
    // contentEditable's default Enter behavior slips through. Our keydown
    // handler intercepts Enter before that happens, so this is a safety net.
    if (el.tagName === "DIV" || el.tagName === "P") return inner + "\n";
    return wrapFor(el.tagName, inner, el.getAttribute("href") ?? undefined);
  }

  let out = "";
  root.childNodes.forEach((child) => {
    out += serialize(child);
  });
  return out.replace(/\n+$/g, "");
}