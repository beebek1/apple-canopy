import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ElementType, KeyboardEvent as ReactKeyboardEvent } from "react";
import { Plus, Heading2, ListOrdered, Quote, ImagePlus, Trash2, X } from "lucide-react";
import { newBlockId } from "./types";
import type { BlockType, ContentBlock, ParagraphBlock } from "./types";
import { uploadImageApi } from "../auth.api";
import SelectionToolbar from "./SelectionToolbar";
import { InlineText, htmlToMarkdown, markdownToHtml } from "./RichText";
import { resolveMediaUrl } from "../../../shared/resolveMediaUrl";

interface ContentFlowProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  // Called when Backspace is pressed at the very start of the first block —
  // lets the page move focus back up into the dek field.
  onLeaveTop?: () => void;
}

export interface ContentFlowHandle {
  focusFirst: () => void;
}

type FocusTarget = { key: string; caret: "start" | "end" };

// Any field the editor can focus/register: plain textareas and inputs
// (heading, listicle, pullquote, image caption) plus the paragraph block's
// contentEditable div.
type EditableEl = HTMLTextAreaElement | HTMLInputElement | HTMLDivElement;

const MENU_OPTIONS: { type: BlockType; label: string; icon: ElementType }[] = [
  { type: "heading", label: "Heading", icon: Heading2 },
  { type: "listicle", label: "Numbered list item", icon: ListOrdered },
  { type: "pullquote", label: "Pull quote", icon: Quote },
  { type: "image", label: "Image", icon: ImagePlus },
];

function autoGrow(el: EditableEl | null) {
  if (!el || !(el instanceof HTMLTextAreaElement)) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

// ---------- Caret helpers for the contentEditable paragraph field ----------

// Character offset of the caret within `el`, counting only text content
// (so it lines up with plain-string indices, same as textarea.selectionStart).
function getCaretOffset(el: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer)) return 0;
  const preRange = range.cloneRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString().length;
}

// Places the caret at a text-offset inside `el` (walks text nodes in order).
function setCaretOffset(el: HTMLElement, offset: number) {
  const sel = window.getSelection();
  if (!sel) return;
  let remaining = offset;
  let targetNode: Node | null = null;
  let targetOffset = 0;

  function walk(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length ?? 0;
      if (remaining <= len) {
        targetNode = node;
        targetOffset = remaining;
        return true;
      }
      remaining -= len;
      return false;
    }
    for (const child of Array.from(node.childNodes)) {
      if (walk(child)) return true;
    }
    return false;
  }

  walk(el);
  const range = document.createRange();
  if (targetNode) {
    range.setStart(targetNode, targetOffset);
  } else {
    range.selectNodeContents(el);
    range.collapse(false);
  }
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

// One focus+caret helper that works across textareas/inputs AND the
// contentEditable div, so call sites don't need to branch on element type.
function focusAndPlaceCaret(el: EditableEl, caret: "start" | "end") {
  el.focus();
  if (el instanceof HTMLDivElement) {
    setCaretOffset(el, caret === "start" ? 0 : (el.textContent?.length ?? 0));
  } else {
    const pos = caret === "start" ? 0 : el.value.length;
    el.setSelectionRange(pos, pos);
  }
}

// Splits a contentEditable's live DOM at the current caret using native
// Range cloning, so any bold/italic/link tags on each side of the split
// survive intact (rather than being lost by re-parsing plain text).
function splitElementAtCaret(el: HTMLElement): { before: string; after: string } {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return { before: htmlToMarkdown(el), after: "" };
  const range = sel.getRangeAt(0);

  const beforeRange = document.createRange();
  beforeRange.selectNodeContents(el);
  beforeRange.setEnd(range.startContainer, range.startOffset);

  const afterRange = document.createRange();
  afterRange.selectNodeContents(el);
  afterRange.setStart(range.startContainer, range.startOffset);

  const beforeDiv = document.createElement("div");
  beforeDiv.appendChild(beforeRange.cloneContents());
  const afterDiv = document.createElement("div");
  afterDiv.appendChild(afterRange.cloneContents());

  return { before: htmlToMarkdown(beforeDiv), after: htmlToMarkdown(afterDiv) };
}

function renumberListicles(blocks: ContentBlock[]): ContentBlock[] {
  let n = 0;
  return blocks.map((b) => (b.type === "listicle" ? { ...b, number: ++n } : b));
}

// Keeps a single always-present, plain paragraph line right after ANY
// special block (heading, list, quote, image) so there's always somewhere
// to click/type to "leave" that mode. Only touches the array when the very
// last block isn't already a plain paragraph.
function normalizeBlocks(blocks: ContentBlock[]): ContentBlock[] {
  const renumbered = renumberListicles(blocks);
  const last = renumbered[renumbered.length - 1];
  if (last && last.type !== "paragraph") {
    return [...renumbered, { id: newBlockId(), type: "paragraph", text: "" }];
  }
  return renumbered;
}

// overflow-hidden kills the native textarea scrollbar that shows up before
// autoGrow has run (or on any frame where scrollHeight is off by a pixel).
const inputBase =
  "w-full resize-none overflow-hidden bg-transparent focus:outline-none placeholder:text-gray-300";

const ContentFlow = forwardRef<ContentFlowHandle, ContentFlowProps>(function ContentFlow(
  { blocks = [], onChange, onLeaveTop },
  ref
) {
  // Defaults to the first block so the "+" is visible the moment the page
  // loads, before the user has focused anything.
  const [activeId, setActiveId] = useState<string | null>(() => blocks[0]?.id ?? null);
  const [menuForId, setMenuForId] = useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = useState<FocusTarget | null>(null);
  // Which field (by key) should show the "write something first" nudge.
  const [warningKey, setWarningKey] = useState<string | null>(null);
  const fieldRefs = useRef<Map<string, EditableEl>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const menuPopupRef = useRef<HTMLDivElement | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Dedicated ref to whichever field belongs to blocks[0]. focusFirst() reads
  // this directly instead of going through fieldRefs + pendingFocus, so there's
  // no state round-trip or timing window where the element might not be there yet.
  const firstFieldRef = useRef<EditableEl | null>(null);

  function registerRef(key: string, el: EditableEl | null, blockId?: string) {
    if (el) {
      fieldRefs.current.set(key, el);
      autoGrow(el);
    } else {
      fieldRefs.current.delete(key);
    }
    if (blockId && blocks[0]?.id === blockId) {
      firstFieldRef.current = el;
    }
  }

  useImperativeHandle(ref, () => ({
    focusFirst: () => {
      const el = firstFieldRef.current;
      if (!el) return;
      focusAndPlaceCaret(el, "start");
    },
  }));

  useEffect(() => {
    if (!pendingFocus) return;
    const el = fieldRefs.current.get(pendingFocus.key);
    if (el) focusAndPlaceCaret(el, pendingFocus.caret);
    setPendingFocus(null);
  }, [pendingFocus, blocks]);

  // Close the block-insert menu on outside click. Clicks on the toggle
  // button itself are ignored here so its own onClick can toggle normally
  // (otherwise this fires first on mousedown and closes it, then the click
  // handler immediately reopens it).
  useEffect(() => {
    if (!menuForId) return;
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (menuPopupRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-plus-toggle]")) return;
      setMenuForId(null);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuForId]);

  // Esc closes the menu if it's open; otherwise, if focus is inside any
  // special block (list, heading, quote, image), Esc exits that mode by
  // jumping to the trailing paragraph line after it.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (menuForId) {
        setMenuForId(null);
        return;
      }
      const current = blocks.find((b) => b.id === activeId);
      if (current && current.type !== "paragraph") {
        exitSpecialMode(current.id);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuForId, activeId, blocks]);

  // Shows a warm little nudge under a field for a couple seconds instead of
  // silently doing nothing when Enter is pressed on an empty line.
  function showFieldWarning(key: string) {
    setWarningKey(key);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => setWarningKey(null), 1800);
  }

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  function updateBlock(id: string, patch: Partial<ContentBlock>) {
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as ContentBlock) : b)));
  }

  function removeBlock(id: string) {
    const filtered = blocks.filter((b) => b.id !== id);
    // Never let the editor drop to zero blocks — always leave one empty
    // paragraph so there's somewhere to keep typing.
    if (filtered.length === 0) {
      onChange([{ id: newBlockId(), type: "paragraph", text: "" }]);
      return;
    }
    onChange(normalizeBlocks(filtered));
  }

  function insertParagraphAfter(id: string, text: string) {
    const index = blocks.findIndex((b) => b.id === id);
    const block: ContentBlock = { id: newBlockId(), type: "paragraph", text };
    const next = [...blocks];
    next.splice(index + 1, 0, block);
    onChange(normalizeBlocks(next));
    setPendingFocus({ key: block.id, caret: "start" });
  }

  // Converts the CURRENT block into the chosen type in place, instead of
  // inserting a new block after it. Whatever text was already in the block
  // carries over as the starting content of the new type.
  function convertBlockTo(id: string, type: BlockType) {
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const current = blocks[index];

    let carriedText = "";
    if (current.type === "paragraph" || current.type === "heading") carriedText = current.text;
    else if (current.type === "pullquote") carriedText = current.quote;
    else if (current.type === "listicle") carriedText = current.title;

    let next: ContentBlock;
    switch (type) {
      case "paragraph":
        next = { id: current.id, type: "paragraph", text: carriedText };
        break;
      case "heading":
        next = { id: current.id, type: "heading", text: carriedText };
        break;
      case "listicle":
        next = { id: current.id, type: "listicle", title: carriedText, description: "", number: 0 };
        break;
      case "pullquote":
        next = { id: current.id, type: "pullquote", quote: carriedText, attribution: "" };
        break;
      case "image":
        next = { id: current.id, type: "image", src: "", caption: "" };
        break;
      default:
        return;
    }

    const nextBlocks = [...blocks];
    nextBlocks[index] = next;
    onChange(normalizeBlocks(nextBlocks));
    setMenuForId(null);

    if (type === "listicle") setPendingFocus({ key: `${next.id}:title`, caret: "end" });
    else if (type !== "image") setPendingFocus({ key: next.id, caret: "end" });
  }

  // Enter inside a list item's DESCRIPTION adds the NEXT numbered item,
  // continuing the sequence, instead of dropping back to a plain paragraph.
  function continueListicleAfter(id: string) {
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const block: ContentBlock = { id: newBlockId(), type: "listicle", title: "", description: "", number: 0 };
    const next = [...blocks];
    next.splice(index + 1, 0, block);
    onChange(normalizeBlocks(next));
    setPendingFocus({ key: `${block.id}:title`, caret: "start" });
  }

  // Jumps focus past the end of the current "mode" — a run of list items,
  // or a single heading/quote/image block — onto the trailing plain
  // paragraph (creating one if it's somehow missing).
  function exitSpecialMode(blockId: string) {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;
    if (blocks[index].type === "paragraph") return;

    let idx = index;
    if (blocks[index].type === "listicle") {
      while (idx < blocks.length && blocks[idx].type === "listicle") idx++;
    } else {
      idx = index + 1;
    }

    if (idx < blocks.length) {
      const target = blocks[idx];
      const key = target.type === "listicle" ? `${target.id}:title` : target.id;
      setPendingFocus({ key, caret: "start" });
    } else {
      const block: ContentBlock = { id: newBlockId(), type: "paragraph", text: "" };
      onChange([...blocks, block]);
      setPendingFocus({ key: block.id, caret: "start" });
    }
  }

  function handleEnterInTextField(
    e: ReactKeyboardEvent<HTMLTextAreaElement>,
    blockId: string,
    field: "text" | "quote"
  ) {
    e.preventDefault();
    const el = e.currentTarget;
    const before = el.value.slice(0, el.selectionStart ?? el.value.length);
    const after = el.value.slice(el.selectionStart ?? el.value.length);
    updateBlock(blockId, { [field]: before } as Partial<ContentBlock>);
    insertParagraphAfter(blockId, after);
  }

  // Shared "remove this block and jump back to the previous one" behavior,
  // used by heading/listicle/pullquote/paragraph. `atStart` is computed by
  // each call site since a contentEditable div has no .selectionStart.
  function handleBackspaceMaybeRemove(
    e: ReactKeyboardEvent<HTMLElement>,
    blockId: string,
    isEmpty: boolean,
    atStart: boolean
  ) {
    if (!atStart || !isEmpty) return;

    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === 0) {
      e.preventDefault();
      onLeaveTop?.();
      return;
    }
    e.preventDefault();
    const prev = blocks[index - 1];
    removeBlock(blockId);
    if ("text" in prev) setPendingFocus({ key: prev.id, caret: "end" });
    else if (prev.type === "pullquote") setPendingFocus({ key: prev.id, caret: "end" });
  }

  // Clicking empty space below the last block (Medium does this too) drops
  // you into the end of the last block instead of doing nothing.
  function handleContainerClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    const last = blocks[blocks.length - 1];
    if (!last) return;
    if (last.type === "image") {
      insertParagraphAfter(last.id, "");
      return;
    }
    const key = last.type === "listicle" ? `${last.id}:title` : last.id;
    const el = fieldRefs.current.get(key);
    if (el) focusAndPlaceCaret(el, "end");
  }

  return (
    <div
      ref={containerRef}
      className="space-y-1 min-h-[220px] cursor-text"
      onClick={handleContainerClick}
    >
      {blocks.map((block) => {
        const isActive = activeId === block.id;
        const menuOpen = menuForId === block.id;
        // The "+" only ever shows on the block that currently has focus
        // (or whose menu is open) — never on hover, never on more than one
        // line at a time.
        const showPlus = isActive || menuOpen;

        return (
          <div
            key={block.id}
            className="group relative py-1.5"
            onFocus={() => setActiveId(block.id)}
          >
            {/* Floating plus — absolutely positioned outside the text column
                so it never eats into the paragraph's width. Rotates into an
                "x" when its menu is open, with a little press-tilt on click. */}
            <button
              type="button"
              data-plus-toggle
              onClick={() => setMenuForId(menuOpen ? null : block.id)}
              className={`absolute -left-8 sm:-left-10 top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full border bg-white flex items-center justify-center transition-all duration-300 ease-out cursor-pointer active:scale-90 hover:scale-110 ${
                menuOpen
                  ? "rotate-45 border-[#11512a] text-[#11512a]"
                  : "rotate-0 border-gray-200 text-gray-400 hover:border-[#11512a] hover:text-[#11512a]"
              } ${showPlus ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              aria-label="Add block"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {menuOpen && (
              <div
                ref={menuPopupRef}
                className="absolute z-20 -left-8 sm:-left-10 top-9 sm:top-10 w-44 sm:w-52 rounded-xl border border-gray-200 bg-white shadow-lg py-1.5"
              >
                {MENU_OPTIONS.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => convertBlockTo(block.id, type)}
                    className="w-full flex items-center gap-2.5 text-left px-3 sm:px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-[#11512a] shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Block content — full width now, the "+" floats in the margin
                instead of sharing a flex row with the text. */}
            <div className="relative pb-1">
              {block.type === "paragraph" && (
                <ParagraphBlockEditor
                  block={block}
                  registerRef={registerRef}
                  onTextChange={(text) => updateBlock(block.id, { text } as Partial<ContentBlock>)}
                  onEnter={(e) => {
                    e.preventDefault();
                    const el = e.currentTarget;
                    if ((el.textContent ?? "").trim() === "") {
                      showFieldWarning(block.id);
                      return;
                    }
                    const { before, after } = splitElementAtCaret(el);
                    updateBlock(block.id, { text: before } as Partial<ContentBlock>);
                    insertParagraphAfter(block.id, after);
                  }}
                  onBackspace={(e) => {
                    const el = e.currentTarget;
                    const sel = window.getSelection();
                    const isEmpty = (el.textContent ?? "") === "";
                    const atStart = getCaretOffset(el) === 0 && (sel?.isCollapsed ?? true);
                    handleBackspaceMaybeRemove(e, block.id, isEmpty, atStart);
                  }}
                  warning={warningKey === block.id}
                />
              )}

              {block.type === "heading" && (
                <>
                  <textarea
                    ref={(el) => registerRef(block.id, el, block.id)}
                    value={block.text}
                    onChange={(e) => {
                      updateBlock(block.id, { text: e.target.value } as Partial<ContentBlock>);
                      autoGrow(e.target);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        if (block.text.trim() === "") {
                          e.preventDefault();
                          showFieldWarning(block.id);
                        } else {
                          handleEnterInTextField(e, block.id, "text");
                        }
                      } else if (e.key === "Backspace") {
                        const el = e.currentTarget;
                        const atStart = (el.selectionStart ?? 0) === 0 && (el.selectionEnd ?? 0) === 0;
                        handleBackspaceMaybeRemove(e, block.id, block.text === "", atStart);
                      }
                    }}
                    rows={1}
                    placeholder="Heading"
                    className={`${inputBase} text-xl sm:text-2xl font-semibold text-gray-900 pt-2`}
                  />
                  {warningKey === block.id && (
                    <p className="text-xs text-amber-600 mt-1">Write something first, then press Enter ✍️</p>
                  )}
                </>
              )}

              {block.type === "listicle" && (
                <div className="my-2">
                  <div className="flex items-baseline gap-3 mb-1.5">
                    <span className="text-sm font-bold shrink-0" style={{ color: "#990200" }}>
                      {String(block.number).padStart(2, "0")}
                    </span>
                    <input
                      ref={(el) => registerRef(`${block.id}:title`, el, block.id)}
                      type="text"
                      value={block.title}
                      onChange={(e) =>
                        updateBlock(block.id, { title: e.target.value } as Partial<ContentBlock>)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (block.title.trim() === "") {
                            showFieldWarning(`${block.id}:title`);
                          } else {
                            // Go to the next line WITHIN this block first,
                            // instead of immediately spawning a new item.
                            setPendingFocus({ key: `${block.id}:description`, caret: "end" });
                          }
                        } else if (e.key === "Backspace") {
                          const el = e.currentTarget;
                          const atStart = (el.selectionStart ?? 0) === 0 && (el.selectionEnd ?? 0) === 0;
                          handleBackspaceMaybeRemove(
                            e,
                            block.id,
                            block.title === "" && block.description === "",
                            atStart
                          );
                        }
                      }}
                      placeholder="Item title"
                      className="flex-1 min-w-0 bg-transparent focus:outline-none placeholder:text-gray-300 text-xl font-semibold text-gray-900"
                    />
                  </div>
                  <textarea
                    ref={(el) => registerRef(`${block.id}:description`, el)}
                    value={block.description}
                    onChange={(e) => {
                      updateBlock(block.id, { description: e.target.value } as Partial<ContentBlock>);
                      autoGrow(e.target);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (block.description.trim() === "") {
                          showFieldWarning(`${block.id}:description`);
                        } else {
                          continueListicleAfter(block.id);
                        }
                      }
                    }}
                    rows={1}
                    placeholder="Item description"
                    className={`${inputBase} text-[17px] leading-[1.8] text-gray-700`}
                  />
                  {(warningKey === `${block.id}:title` || warningKey === `${block.id}:description`) && (
                    <p className="text-xs text-amber-600 mt-1">Write something first, then press Enter ✍️</p>
                  )}
                </div>
              )}

              {block.type === "pullquote" && (
                <div className="border-l-2 pl-4 sm:pl-6 my-4 sm:my-6" style={{ borderColor: "#990200" }}>
                  <textarea
                    ref={(el) => registerRef(block.id, el, block.id)}
                    value={block.quote}
                    onChange={(e) => {
                      updateBlock(block.id, { quote: e.target.value } as Partial<ContentBlock>);
                      autoGrow(e.target);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (block.quote.trim() === "") {
                          showFieldWarning(block.id);
                        } else {
                          // Go to attribution first — same "next line" idea
                          // as the listicle's title → description.
                          setPendingFocus({ key: `${block.id}:attribution`, caret: "end" });
                        }
                      } else if (e.key === "Backspace") {
                        const el = e.currentTarget;
                        const atStart = (el.selectionStart ?? 0) === 0 && (el.selectionEnd ?? 0) === 0;
                        handleBackspaceMaybeRemove(
                          e,
                          block.id,
                          block.quote === "" && block.attribution === "",
                          atStart
                        );
                      }
                    }}
                    rows={1}
                    placeholder="A short, quotable line…"
                    className={`${inputBase} text-xl sm:text-2xl font-medium leading-snug text-gray-900`}
                  />
                  <input
                    ref={(el) => registerRef(`${block.id}:attribution`, el)}
                    type="text"
                    value={block.attribution}
                    onChange={(e) =>
                      updateBlock(block.id, { attribution: e.target.value } as Partial<ContentBlock>)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        // From attribution, Enter exits the quote entirely.
                        exitSpecialMode(block.id);
                      }
                    }}
                    placeholder="Attribution (optional)"
                    className="w-full bg-transparent focus:outline-none placeholder:text-gray-400 text-xs text-gray-400 mt-2"
                  />
                  {warningKey === block.id && (
                    <p className="text-xs text-amber-600 mt-1.5">Write something first, then press Enter ✍️</p>
                  )}
                </div>
              )}

              {block.type === "image" && (
                <ImageBlockEditor
                  block={block}
                  onUpdate={(patch) => updateBlock(block.id, patch)}
                  onEnterCaption={() => insertParagraphAfter(block.id, "")}
                />
              )}

              {block.type !== "paragraph" && (
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  aria-label="Remove block"
                  className={
                    block.type === "image"
                      ? "absolute -top-2 -right-2 z-10 p-1.5 rounded-full bg-white text-gray-500 shadow-md border border-gray-200 opacity-80 hover:opacity-100 hover:text-[#990200] hover:bg-red-50 transition-all cursor-pointer"
                      : "absolute -top-1 right-0 p-1 rounded-full text-gray-300 hover:text-[#990200] hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  }
                >
                  {block.type === "image" ? <X className="w-4 h-4" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default ContentFlow;

// Owns its own contentEditable ref (SelectionToolbar needs a stable
// RefObject to measure the live selection against) while still registering
// into the parent's fieldRefs map so the existing focus-management
// (pendingFocus, backspace-to-previous, etc.) keeps working exactly as
// before. Renders real bold/italic/strike/link spans live — the stored
// value is still the same **bold**/*italic*/~~strike~~/[label](url) string,
// converted to/from HTML via markdownToHtml/htmlToMarkdown.
function ParagraphBlockEditor({
  block,
  registerRef,
  onTextChange,
  onEnter,
  onBackspace,
  warning,
}: {
  block: ParagraphBlock;
  registerRef: (key: string, el: EditableEl | null, blockId?: string) => void;
  onTextChange: (text: string) => void;
  onEnter: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
  onBackspace: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
  warning: boolean;
}) {
  const localRef = useRef<HTMLDivElement | null>(null);
  // Tracks the markdown string we last pushed into/read out of the DOM, so
  // the sync effect below only touches innerHTML when the change came from
  // OUTSIDE this element (e.g. block conversion) — never on every keystroke,
  // or React would reset the caret position each time.
  const lastSerialized = useRef<string>(block.text);

  useEffect(() => {
    const el = localRef.current;
    if (!el || block.text === lastSerialized.current) return;
    el.innerHTML = markdownToHtml(block.text);
    lastSerialized.current = block.text;
  }, [block.text]);

  function handleInput() {
    const el = localRef.current;
    if (!el) return;
    // Some browsers leave a stray empty inline tag (e.g. <br> or <span>)
    // behind after deleting all text — clear it so the placeholder shows.
    if ((el.textContent ?? "") === "" && el.innerHTML !== "") el.innerHTML = "";
    const markdown = htmlToMarkdown(el);
    lastSerialized.current = markdown;
    onTextChange(markdown);
  }

  return (
    <>
      <SelectionToolbar targetRef={localRef} />
      <div
        ref={(el) => {
          localRef.current = el;
          registerRef(block.id, el, block.id);
          if (el && el.innerHTML === "" && block.text) {
            el.innerHTML = markdownToHtml(block.text);
            lastSerialized.current = block.text;
          }
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          const anchor = target.closest("a");
          if (anchor) {
            e.preventDefault();
            const href = anchor.getAttribute("href");
            if (href) window.open(href, "_blank", "noopener,noreferrer");
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) onEnter(e);
          else if (e.key === "Backspace") onBackspace(e);
        }}
        data-placeholder="Write here… press '+' for more, or select text to format it"
        className={`${inputBase} text-[17px] leading-[1.8] text-gray-800 min-h-[28px] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none`}
      />
      {warning && (
        <p className="text-xs text-amber-600 mt-1">Write something first, then press Enter ✍️</p>
      )}
    </>
  );
}

function ImageBlockEditor({
  block,
  onUpdate,
  onEnterCaption,
}: {
  block: Extract<ContentBlock, { type: "image" }>;
  onUpdate: (patch: Partial<ContentBlock>) => void;
  onEnterCaption: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Uploads the file to the backend immediately and stores the returned
  // path in the block, instead of stuffing a base64 blob into state. Path
  // is what gets persisted, so `content` never carries raw image bytes.
  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImageApi(formData);
      onUpdate({ src: res.data.data.path } as Partial<ContentBlock>);
    } catch {
      // Upload failed — leave the block without a src so the "click to
      // upload" placeholder stays visible instead of showing a broken image.
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="my-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {block.src ? (
        <div className="relative rounded-lg overflow-hidden bg-gray-100">
          <img src={resolveMediaUrl(block.src)} alt="" className="w-full max-h-64 sm:max-h-[420px] object-cover" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-gray-200 hover:border-[#11512a]/40 hover:bg-[#11512a]/[0.03] flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-[#11512a] transition-colors cursor-pointer disabled:opacity-60"
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-xs font-medium">
            {uploading ? "Uploading…" : "Click to upload an image"}
          </span>
        </button>
      )}
      <input
        type="text"
        value={block.caption}
        onChange={(e) => onUpdate({ caption: e.target.value } as Partial<ContentBlock>)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnterCaption();
          }
        }}
        placeholder="Image caption"
        className="w-full bg-transparent focus:outline-none placeholder:text-gray-400 text-xs text-gray-400 text-center mt-2"
      />
    </div>
  );
}

// ---------- Read-only renderer, reused by the preview ----------
export function ContentFlowReadOnly({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        switch (block.type) {
          case "paragraph":
            return block.text ? (
              <p key={block.id} className="text-[17px] leading-[1.8] text-gray-800">
                <InlineText text={block.text} />
              </p>
            ) : null;

          case "heading":
            return block.text ? (
              <h2 key={block.id} className="text-xl font-semibold text-gray-900 pt-1">
                {block.text}
              </h2>
            ) : null;

          case "listicle":
            return (
              <div key={block.id}>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-sm font-bold shrink-0" style={{ color: "#990200" }}>
                    {String(block.number).padStart(2, "0")}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {block.title || "Untitled item"}
                  </h3>
                </div>
                <p className="text-[17px] leading-[1.8] text-gray-700">{block.description}</p>
              </div>
            );

          case "pullquote":
            return block.quote ? (
              <blockquote key={block.id} className="border-l-2 pl-6 my-6 sm:my-10" style={{ borderColor: "#990200" }}>
                <p className="text-2xl leading-snug font-medium text-gray-900">{block.quote}</p>
                {block.attribution && (
                  <cite className="block mt-2 text-xs not-italic text-gray-400">— {block.attribution}</cite>
                )}
              </blockquote>
            ) : null;

            case "image":
              return block.src ? (
                <figure key={block.id}>
                  <div className="rounded-lg overflow-hidden bg-gray-100">
                    <img src={resolveMediaUrl(block.src)} alt={block.caption} className="w-full object-cover" />
                  </div>
                {block.caption && (
                  <figcaption className="text-xs text-gray-400 mt-2 text-center">{block.caption}</figcaption>
                )}
              </figure>
            ) : null;

          default:
            return null;
        }
      })}
    </div>
  );
}