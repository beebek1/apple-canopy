import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Eye, ImagePlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, createEmptyDraft, fileToDataUrl, hasContent } from "./components/types";
import type { BlogPostDraft } from "./components/types";
import ContentFlow from "./components/ContentFlow";
import type { ContentFlowHandle } from "./components/ContentFlow";
import ArticlePreview from "./components/ArticlePreview";

interface BlogEditorProps {
  // Pass an existing draft when editing an article; omit to start a new one.
  initialDraft?: BlogPostDraft;
  // Author is derived from the logged-in user — decode it from the JWT /
  // auth context wherever <BlogEditor /> gets mounted, and pass it in here.
  // It is never an editable field.
  authorName?: string;
  // TODO: wire these up to your real API calls.
  onSaveDraft?: (draft: BlogPostDraft) => Promise<void> | void;
  onPublish?: (draft: BlogPostDraft) => Promise<void> | void;
}

function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export default function BlogEditor({
  initialDraft,
  authorName = "You",
  onSaveDraft,
  onPublish,
}: BlogEditorProps) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BlogPostDraft>(initialDraft ?? createEmptyDraft());
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const dekRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const flowRef = useRef<ContentFlowHandle>(null);

  // Grow title/dek to fit whatever initialDraft brings in, and get rid of
  // the one-frame scrollbar you'd otherwise see before the first keystroke.
  useEffect(() => {
    autoGrow(titleRef.current);
    autoGrow(dekRef.current);
  }, []);

  function updateDraft(patch: Partial<BlogPostDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleCoverFile(file: File | undefined) {
    if (!file) return;
    setUploadingCover(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      updateDraft({ heroImage: dataUrl });
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSaveDraft() {
    if (!hasContent(draft)) {
      showToast("Write something before you save this as a draft");
      titleRef.current?.focus();
      return;
    }
    setSavingDraft(true);
    try {
      if (onSaveDraft) await onSaveDraft({ ...draft, status: "draft" });
      else await new Promise((r) => setTimeout(r, 600)); // TODO: real API call
      updateDraft({ status: "draft" });
      showToast("Draft saved");
    } finally {
      setSavingDraft(false);
    }
  }

  async function handlePublish() {
    if (!hasContent(draft)) {
      showToast("Write something before you publish");
      titleRef.current?.focus();
      return;
    }
    setPublishing(true);
    try {
      const toSend = { ...draft, status: "published" as const };
      if (onPublish) await onPublish(toSend);
      else await new Promise((r) => setTimeout(r, 600)); // TODO: real API call
      updateDraft({ status: "published" });
      showToast("Article published");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-['Poppins',_sans-serif] overflow-x-hidden">
      {/* Slim top bar — stays out of the way while writing.
          Wraps to a second row on narrow screens instead of overflowing. */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-[760px] px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 order-1">
            {/* Back — returns to wherever the editor was opened from. */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              title="Back"
              aria-label="Back"
              className="p-1.5 sm:p-2 -ml-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#11512a] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setCatMenuOpen((o) => !o)}
                className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors cursor-pointer max-w-[32vw] sm:max-w-none truncate"
              >
                <span className="truncate">{draft.category}</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>
              {catMenuOpen && (
                <div className="absolute z-10 left-0 mt-1 w-44 rounded-lg border border-gray-200 bg-white shadow-sm py-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        updateDraft({ category: c });
                        setCatMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 order-3 sm:order-2 w-full sm:w-auto justify-end flex-wrap">
            <span className="hidden sm:inline text-xs text-gray-500">
              By <span className="font-medium text-gray-700">{authorName}</span>
            </span>
            <span
              className={`text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
                draft.status === "published"
                  ? "bg-[#e9f2ec] text-[#11512a]"
                  : "bg-[#fdf3e7] text-[#a3690c]"
              }`}
            >
              {draft.status === "published" ? "Published" : "Draft"}
            </span>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              title="Preview"
              className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft || publishing}
              className="text-[11px] sm:text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full transition-colors cursor-pointer disabled:opacity-60"
            >
              {savingDraft ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={savingDraft || publishing}
              style={{ backgroundColor: "#11512a" }}
              className="text-[11px] sm:text-xs font-semibold text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-70"
            >
              {publishing ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Writing surface */}
      <div className="mx-auto max-w-[760px] px-6 sm:px-10 py-6 sm:py-10">
        {/* Cover image */}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleCoverFile(e.target.files?.[0])}
        />
        {draft.heroImage ? (
          <div className="relative group rounded-lg overflow-hidden mb-6 sm:mb-8 bg-gray-100">
            <img src={draft.heroImage} alt="" className="w-full max-h-56 sm:max-h-80 object-cover" />
            <button
              type="button"
              onClick={() => updateDraft({ heroImage: null })}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 rounded-full bg-black/60 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Remove cover image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#11512a] mb-6 sm:mb-8 transition-colors cursor-pointer disabled:opacity-60"
          >
            <ImagePlus className="w-4 h-4" />
            {uploadingCover ? "Uploading…" : "Add a cover image"}
          </button>
        )}

        {/* Title — overflow-hidden kills the scrollbar that shows before autoGrow runs */}
        <textarea
          ref={titleRef}
          value={draft.title}
          onChange={(e) => {
            updateDraft({ title: e.target.value });
            autoGrow(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              dekRef.current?.focus();
            }
          }}
          rows={1}
          placeholder="Title"
          className="w-full resize-none overflow-hidden bg-transparent focus:outline-none placeholder:text-gray-300 text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-5"
        />

        {/* Dek */}
        <textarea
          ref={dekRef}
          value={draft.dek}
          onChange={(e) => {
            updateDraft({ dek: e.target.value });
            autoGrow(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              flowRef.current?.focusFirst();
            } else if (e.key === "Backspace" && draft.dek === "") {
              e.preventDefault();
              titleRef.current?.focus();
            }
          }}
          rows={1}
          placeholder="Write a short description…"
          className="w-full resize-none overflow-hidden bg-transparent focus:outline-none placeholder:text-gray-300 text-lg sm:text-xl text-gray-500 leading-relaxed mb-2"
        />

        <div className="mb-6 sm:mb-8" />

        {/* Body — min-h and a click-to-focus-end handler live inside ContentFlow now,
            so there's always visible, clickable space to keep writing in. */}
        <ContentFlow
          ref={flowRef}
          blocks={draft.blocks}
          onChange={(blocks) => updateDraft({ blocks })}
          onLeaveTop={() => dekRef.current?.focus()}
        />
      </div>

      <ArticlePreview
        draft={draft}
        authorName={authorName}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg z-50 max-w-[92vw] text-center">
          {toast}
        </div>
      )}
    </div>
  );
}