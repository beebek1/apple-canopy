export type ArticleStatus = "draft" | "published";
export type BlockType = "paragraph" | "heading" | "listicle" | "pullquote" | "image";
import { CATEGORIES } from "../../../shared/categories";
export interface ParagraphBlock {
  id: string;
  type: "paragraph";
  text: string;
}

export interface HeadingBlock {
  id: string;
  type: "heading";
  text: string;
}

export interface ListicleBlock {
  id: string;
  type: "listicle";
  number: number;
  title: string;
  description: string;
}

export interface PullQuoteBlock {
  id: string;
  type: "pullquote";
  quote: string;
  attribution: string;
}

export interface ImageBlock {
  id: string;
  type: "image";
  src: string; // data URL for now — swap for an uploaded asset URL later
  caption: string;
}

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListicleBlock
  | PullQuoteBlock
  | ImageBlock;

// Author and publish date are intentionally NOT part of this shape.
// Author comes from the logged-in user (decode it from the JWT / auth
// context server-side or in a wrapper around BlogEditor). Publish date is
// stamped by the backend the instant status flips to "published".
export interface BlogPostDraft {
  id?: string;
  title: string;
  dek: string;
  category: string;
  heroImage: string | null;
  blocks: ContentBlock[];
  status: ArticleStatus;
}

let idCounter = 0;
export function newBlockId(): string {
  idCounter += 1;
  return `blk_${Date.now().toString(36)}_${idCounter}`;
}

export function nextListicleNumber(blocks: ContentBlock[]): number {
  return blocks.filter((b) => b.type === "listicle").length + 1;
}

export function createBlock(type: BlockType, blocks: ContentBlock[]): ContentBlock {
  const id = newBlockId();
  switch (type) {
    case "paragraph":
      return { id, type: "paragraph", text: "" };
    case "heading":
      return { id, type: "heading", text: "" };
    case "listicle":
      return {
        id,
        type: "listicle",
        number: nextListicleNumber(blocks),
        title: "",
        description: "",
      };
    case "pullquote":
      return { id, type: "pullquote", quote: "", attribution: "" };
    case "image":
      return { id, type: "image", src: "", caption: "" };
  }
}

export function createEmptyDraft(): BlogPostDraft {
  return {
    title: "",
    dek: "",
    category: CATEGORIES[0],
    heroImage: null,
    blocks: [{ id: newBlockId(), type: "paragraph", text: "" }],
    status: "draft",
  };
}

// Reads a File into a base64 data URL. Swap this out for a real upload
// call (e.g. POST to /api/uploads) whenever the backend is ready.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// True once there's anything worth saving: a title, a dek, a hero image,
// or any block with real text/an uploaded image in it. Used to stop
// "Save draft" / "Publish" from firing on a completely blank post.
export function hasContent(draft: BlogPostDraft): boolean {
  if (draft.title.trim() || draft.dek.trim() || draft.heroImage) return true;
  return draft.blocks.some((block) => {
    switch (block.type) {
      case "paragraph":
      case "heading":
        return block.text.trim() !== "";
      case "listicle":
        return block.title.trim() !== "" || block.description.trim() !== "";
      case "pullquote":
        return block.quote.trim() !== "";
      case "image":
        return block.src.trim() !== "";
      default:
        return false;
    }
  });
}