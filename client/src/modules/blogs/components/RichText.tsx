import { Fragment, type ReactNode } from "react";

const INLINE_PATTERN =
  /\[([^\]]+)\]\(([^)]+)\)|\*\*(.+?)\*\*|~~(.+?)~~|\*(.+?)\*/;

function parseInline(text: string, keyPrefix = "n"): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const match = INLINE_PATTERN.exec(remaining);
    if (!match) {
      nodes.push(remaining);
      break;
    }

    const [full, linkText, linkHref, bold, strike, italic] = match;
    const before = remaining.slice(0, match.index);
    if (before) nodes.push(before);

    if (linkText !== undefined) {
        nodes.push(
        <a
            key={`${keyPrefix}-${key++}`}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#11512a] underline underline-offset-2 hover:text-[#0d3f21]"
        >
            {parseInline(linkText, `${keyPrefix}-${key}`)}
        </a>,
        );
    } else if (bold !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-${key++}`} className="font-semibold text-gray-900">
          {parseInline(bold, `${keyPrefix}-${key}`)}
        </strong>,
      );
    } else if (strike !== undefined) {
      nodes.push(
        <s key={`${keyPrefix}-${key++}`} className="text-gray-500">
          {parseInline(strike, `${keyPrefix}-${key}`)}
        </s>,
      );
    } else if (italic !== undefined) {
      nodes.push(
        <em key={`${keyPrefix}-${key++}`}>{parseInline(italic, `${keyPrefix}-${key}`)}</em>,
      );
    }

    remaining = remaining.slice(match.index + full.length);
  }

  return nodes;
}

// Renders **bold**, *italic*, ~~strike~~, [text](url), and turns literal
// "\n" into line breaks — used for any block's plain-text fields.
export default function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {parseInline(line, `l${i}`)}
        </Fragment>
      ))}
    </>
  );
}