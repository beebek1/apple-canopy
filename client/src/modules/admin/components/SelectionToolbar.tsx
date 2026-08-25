import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Bold, Italic, Strikethrough, Link2 } from "lucide-react";

interface SelectionToolbarProps {
  // The contentEditable div the toolbar watches for selections inside.
  targetRef: RefObject<HTMLDivElement | null>;
}

// contentEditable selections expose real bounding rects (unlike a plain
// textarea), so there's no more mirror-div measuring hack here. Formatting
// itself is applied with document.execCommand, which natively toggles
// bold/italic/strikeThrough/createLink on whatever's selected.
export default function SelectionToolbar({ targetRef }: SelectionToolbarProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [linkPromptOpen, setLinkPromptOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const savedRangeRef = useRef<Range | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleSelectionChange() {
      const el = targetRef.current;
      const sel = window.getSelection();
      if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setPos(null);
        setLinkPromptOpen(false);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) {
        setPos(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      savedRangeRef.current = range.cloneRange();
      setPos({ top: rect.top - 46, left: rect.left + rect.width / 2 });
    }

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [targetRef]);

  // Closes the toolbar if focus leaves the editable block entirely (e.g.
  // clicking elsewhere on the page), same idea as the old blur handler.
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (toolbarRef.current?.contains(target)) return;
      if (targetRef.current?.contains(target)) return;
      setPos(null);
      setLinkPromptOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [targetRef]);

  function restoreSelection() {
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  function apply(command: "bold" | "italic" | "strikeThrough") {
    targetRef.current?.focus();
    restoreSelection();
    document.execCommand(command);
    setPos(null);
  }

  function applyLink() {
    const url = linkValue.trim();
    if (!url) return;
    targetRef.current?.focus();
    restoreSelection();
    document.execCommand("createLink", false, url);
    setPos(null);
    setLinkPromptOpen(false);
    setLinkValue("");
  }

  if (!pos) return null;

  return (
    <div
      ref={toolbarRef}
      style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
      className="fixed z-50 flex items-center gap-0.5 rounded-lg bg-gray-900 text-white shadow-lg px-1 py-1 animate-in fade-in zoom-in-95 duration-100"
    >
      {linkPromptOpen ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyLink();
          }}
          className="flex items-center px-1"
        >
          <input
            autoFocus
            type="text"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            placeholder="Paste a link…"
            className="w-40 bg-gray-800 text-xs text-white placeholder:text-gray-400 rounded px-2 py-1.5 focus:outline-none"
          />
        </form>
      ) : (
        <>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => apply("bold")}
            title="Bold"
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => apply("italic")}
            title="Italic"
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => apply("strikeThrough")}
            title="Strikethrough"
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-gray-700 mx-0.5" />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setLinkPromptOpen(true)}
            title="Link"
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
      {/* Little pointer nub so the toolbar visibly anchors to the selection below it */}
      <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45 -translate-x-1/2" />
    </div>
  );
}