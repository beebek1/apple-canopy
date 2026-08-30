import { useEffect, useRef, useState } from "react";
import { MdArrowBack, MdKeyboardArrowDown, MdVisibility, MdAddPhotoAlternate, MdClose, MdCloudSync, MdOutlineSyncDisabled, MdSync, MdCloudDone, MdUpload} from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";

import { CATEGORIES, createEmptyDraft, hasContent } from "../components/types";
import type { BlogPostDraft } from "../components/types";
import ContentFlow from "../components/ContentFlow";
import type { ContentFlowHandle } from "../components/ContentFlow";
import ArticlePreview from "../components/ArticlePreview";
import { uploadImageApi, saveDraftApi, getPostApi } from "../auth.api";

interface BlogEditorProps {
  // Pass an existing draft when editing an article; omit to start a new one.
  // Rarely needed now that the component fetches by :blogId itself, but
  // kept for anywhere that still wants to hand one in directly.
  initialDraft?: BlogPostDraft;
  // Author is derived from the logged-in user — decode it from the JWT /
  // auth context wherever <BlogEditor /> gets mounted, and pass it in here.
  // No longer shown in the top bar, but still used by ArticlePreview.
  authorName?: string;
  // TODO: wire this up to your real API call.
  onPublish?: (draft: BlogPostDraft) => Promise<void> | void;
}

type SyncStatus = "idle" | "saving" | "saved" | "error";

function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

// How long to wait after the last edit before firing an autosave request.
// Matches the "pause typing, it saves itself" feel of Google Docs without
// sending a request on every single keystroke.
const AUTOSAVE_DELAY_MS = 1200;

export default function BlogEditor({
  initialDraft,
  authorName = "You",
  onPublish,
}: BlogEditorProps) {
  const navigate = useNavigate();
  // Route is either /admin/blogs/new (fresh post) or /admin/blogs/:blogId
  // (resuming an existing one — including right after this component
  // swaps the URL itself post-first-save, and on a plain page refresh).
  const { blogId } = useParams<{ blogId?: string }>();
  const isExistingRoute = !!blogId && blogId !== "new";

  const [draft, setDraft] = useState<BlogPostDraft>(initialDraft ?? createEmptyDraft());
  const [loadingPost, setLoadingPost] = useState(isExistingRoute && !initialDraft);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [publishing, setPublishing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const dekRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const flowRef = useRef<ContentFlowHandle>(null);

  // Backend id for this post once it exists there. Kept outside `draft`
  // state since BlogPostDraft's shape (title/dek/etc.) mirrors what the
  // editor writes, not backend bookkeeping. First save creates the row and
  // returns an id; every save after that updates the same row. Seeded from
  // the URL directly when opened as /admin/blogs/:blogId, so a fetch and a
  // page refresh both land here without waiting on a network round trip.
  const postIdRef = useRef<string | null>(
    (initialDraft as unknown as { id?: string })?.id ?? (isExistingRoute ? blogId! : null),
  );

  // Guards for the debounced autosave effect below.
  const skipFirstAutoSave = useRef(true);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Grow title/dek to fit whatever initialDraft brings in, and get rid of
  // the one-frame scrollbar you'd otherwise see before the first keystroke.
  useEffect(() => {
    autoGrow(titleRef.current);
    autoGrow(dekRef.current);
  }, []);

  // Loads the post from the backend when opened by id — a direct link, or
  // a refresh after the URL already swapped to /admin/blogs/:blogId.
  useEffect(() => {
    if (!isExistingRoute || initialDraft) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await getPostApi(blogId!);
        const post = res.data.data;
        if (cancelled) return;

        postIdRef.current = post.id;
        // Skip the very next autosave effect run — it'll fire from this
        // setDraft call, and there's nothing new to save yet.
        skipFirstAutoSave.current = true;
        setDraft({
          title: post.title,
          dek: post.dek,
          category: post.category,
          heroImage: post.heroImage ?? null,
          status: post.status === "PUBLISHED" ? "published" : "draft",
          blocks: post.content as BlogPostDraft["blocks"],
        });
        setSyncStatus("saved");
      } catch {
        if (!cancelled) showToast("Couldn't load this article");
      } finally {
        if (!cancelled) setLoadingPost(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  function updateDraft(patch: Partial<BlogPostDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  // Called every time a save/autosave/publish request comes back with an
  // id. If this post didn't have one yet, this was the save that created
  // it — swap the URL from /admin/blogs/new to /admin/blogs/:id so a
  // refresh from here on reloads the real post instead of a blank editor.
  // `replace: true` so this doesn't add a back-button stop.
  function handleSavedId(id: string | undefined) {
    if (!id) return;
    const wasNew = !postIdRef.current;
    postIdRef.current = id;
    if (wasNew) {
      navigate(`/admin/blogs/${id}`, { replace: true });
    }
  }

  async function handleCoverFile(file: File | undefined) {
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await uploadImageApi(formData);
      updateDraft({ heroImage: res.data.data.path });
    } catch {
      showToast("Cover image upload failed");
    } finally {
      setUploadingCover(false);
    }
  }

  // Builds the same FormData shape for both autosave and publish, so the
  // backend only needs to understand one payload format.
  function buildDraftFormData(status: BlogPostDraft["status"]) {
    const formData = new FormData();
    formData.append("title", draft.title);
    formData.append("dek", draft.dek);
    formData.append("category", draft.category);
    formData.append("status", status);
    if (draft.heroImage) formData.append("heroImage", draft.heroImage);
    formData.append("content", JSON.stringify(draft.blocks));
    if (postIdRef.current) formData.append("id", postIdRef.current);
    return formData;
  }

  // Fires automatically after a pause in typing. This is the only thing
  // that persists a draft now — there's no manual "Save draft" button
  // anymore, so `syncStatus` is the person's only signal that their work
  // actually made it to the backend.
  async function autoSaveDraft() {
    if (!hasContent(draft) || publishing) return;
    setSyncStatus("saving");
    try {
      const formData = buildDraftFormData(draft.status);
      const res = await saveDraftApi(formData);
      handleSavedId(res?.data?.data?.id);
      setSyncStatus("saved");
    } catch {
      setSyncStatus("error");
    }
  }

  useEffect(() => {
    // Skip the run that fires from the initial mount — there's nothing new
    // to save yet. Also skipped right after loading a fetched post, above.
    if (skipFirstAutoSave.current) {
      skipFirstAutoSave.current = false;
      return;
    }
    setSyncStatus("idle");
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveDraft();
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  async function handlePublish() {
    if (!hasContent(draft)) {
      showToast("Write something before you publish");
      titleRef.current?.focus();
      return;
    }
    setPublishing(true);
    try {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      const toSend = { ...draft, status: "published" as const };
      if (onPublish) await onPublish(toSend);
      else {
        const formData = buildDraftFormData("published");
        const res = await saveDraftApi(formData);
        handleSavedId(res?.data?.data?.id);
      }
      updateDraft({ status: "published" });
      setSyncStatus("saved");
      showToast("Article published");
    } finally {
      setPublishing(false);
    }
  }

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-white font-['Poppins',_sans-serif] overflow-x-hidden animate-pulse">
        {/* Top bar skeleton — same slots as the real bar, so nothing jumps
            around in height/position once the real content swaps in. */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="mx-auto max-w-[760px] px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100" />
              <div className="w-20 h-6 rounded-full bg-gray-100" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-7 rounded-full bg-gray-100" />
            </div>
          </div>
        </div>

        {/* Writing surface skeleton */}
        <div className="mx-auto max-w-[760px] px-6 sm:px-10 py-6 sm:py-10">
          <div className="w-full h-40 sm:h-56 rounded-lg bg-gray-100 mb-6 sm:mb-8" />
          <div className="h-10 sm:h-12 w-11/12 rounded bg-gray-100 mb-3" />
          <div className="h-10 sm:h-12 w-2/3 rounded bg-gray-100 mb-6" />
          <div className="h-5 w-3/4 rounded bg-gray-100 mb-8" />

          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-5/6 rounded bg-gray-100" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-2/3 rounded bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white font-['Poppins',_sans-serif] overflow-x-clip">
      {/* Slim top bar — stays out of the way while writing.
          Wraps to a second row on narrow screens instead of overflowing. */}
        
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-[760px] px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 order-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              title="Back"
              aria-label="Back"
              className="p-1.5 sm:p-2 -ml-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#11512a] transition-colors cursor-pointer shrink-0"
            >
              <MdArrowBack className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setCatMenuOpen((o) => !o)}
                className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors cursor-pointer max-w-[32vw] sm:max-w-none truncate"
              >
                <span className="truncate">{draft.category}</span>
                <MdKeyboardArrowDown className="w-3.5 h-3.5 shrink-0" />
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
        </div>
      </div>

      {/* Status rail — View / Draft-Published / Synced, as slim outlined
          circles pinned to the vertical middle of the right edge. Each one
          slides out a text label on hover instead of always showing text,
          so the rail itself stays small and unobtrusive. `fixed` + centered
          vertically (rather than bottom-anchored) so it always sits in the
          middle of the viewport regardless of scroll position or page
          length, and won't loiter down near a footer. */}
      <div className="fixed top-1/2 -translate-y-1/2 right-3 sm:right-6 z-20 flex flex-col items-center gap-4">
        {/* Publish — the one filled, colored circle in the rail so it reads
            as the primary action, distinct from the outlined status icons
            below it. */}
        <div className="group relative flex items-center">
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            aria-label="Publish"
            style={{ backgroundColor: "#11512a" }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md hover:opacity-90 hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <MdUpload className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            {publishing ? "Publishing…" : "Publish"}
          </span>
        </div>

        {/* Draft / Published */}
        <div className="group relative flex items-center">
          <span
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center text-[9px] sm:text-[10px] font-bold cursor-default select-none transition-colors ${
              draft.status === "published"
                ? "border-[#11512a]/50 text-[#11512a]"
                : "border-[#a3690c]/50 text-[#a3690c]"
            }`}
          >
            {draft.status === "published" ? "PUB" : "DFT"}
          </span>
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            {draft.status === "published" ? "Published" : "Draft"}
          </span>
        </div>

        {/* View */}
        <div className="group relative flex items-center">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            aria-label="Preview"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 cursor-pointer hover:border-[#11512a] hover:text-[#11512a] transition-colors shadow-sm"
          >
            <MdVisibility className="w-5 h-5" />
          </button>
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            View
          </span>
        </div>

        {/* Sync indicator */}
        <div className="group relative flex items-center">
          <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-gray-300 bg-white flex items-center justify-center shadow-sm cursor-default">
            {syncStatus === "saving" && <MdSync className="w-5 h-5 animate-spin text-amber-500" />}
            {syncStatus === "saved" && <MdCloudSync className="w-5 h-5 text-[#11512a]" />}
            {syncStatus === "error" && <MdOutlineSyncDisabled className="w-5 h-5 text-red-500" />}
            {syncStatus === "idle" && <MdCloudDone className="w-5 h-5 text-gray-400" />}
          </span>
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white opacity-0 translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            {syncStatus === "saving"
              ? "Syncing…"
              : syncStatus === "saved"
              ? "Synced"
              : syncStatus === "error"
              ? "Not synced"
              : "Updated"}
          </span>
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
              <MdClose className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#11512a] mb-6 sm:mb-8 transition-colors cursor-pointer disabled:opacity-60"
          >
            <MdAddPhotoAlternate className="w-4 h-4" />
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