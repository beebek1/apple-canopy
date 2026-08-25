import { useEffect, useState } from "react";
import { X, User } from "lucide-react";
import { ContentFlowReadOnly } from "./ContentFlow";
import type { BlogPostDraft } from "./types";

interface ArticlePreviewProps {
  draft: BlogPostDraft;
  authorName: string;
  open: boolean;
  onClose: () => void;
}

export default function ArticlePreview({ draft, authorName, open, onClose }: ArticlePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setImageLoaded(false);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
  }, [open, draft.heroImage]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    // Overlay: fixed to the viewport, dims the background, centers its
    // child on both axes. Does NOT scroll itself — only the panel below
    // scrolls. z-index is set ABOVE the Navbar's z-[5000] so the overlay
    // covers/dims the navbar too, instead of the navbar (which is fixed
    // and opaque) painting over the modal as it grows taller.
    <div
      className={`fixed inset-0 bg-black/50 z-[6000] flex items-center justify-center p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      {/* Panel: fixed max width, capped height, scrolls internally once
          content exceeds 90% of viewport height. This is the ONLY
          scroll container, so the panel stays centered and stable
          regardless of how much content it holds, and — now that the
          overlay out-ranks the navbar in stacking order — never gets
          cut off by it either. */}
      <div
        className={`bg-white rounded-xl max-w-[760px] w-full max-h-[90vh] overflow-y-auto font-['Poppins',_sans-serif] shadow-2xl transition-all duration-300 ease-out ${
          visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky preview bar */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white/95 backdrop-blur z-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Preview — how readers will see this
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Article body, matches ArticlePage exactly */}
        <div className="px-6 sm:px-10 pt-10 pb-14">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#990200] shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#11512a]">
              {draft.category || "Uncategorized"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-5">
            {draft.title || <span className="text-gray-300">Untitled article</span>}
          </h1>

          {/* Dek */}
          {draft.dek && (
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-8">{draft.dek}</p>
          )}

          {/* Byline row, same as ArticlePage */}
          <div className="flex items-center gap-3 pb-8 mb-8 border-b border-gray-200">
            <span className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <User className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{authorName}</p>
              <p className="text-xs text-gray-400">Draft — not yet published</p>
            </div>
          </div>

          {/* Hero image, same 16:9 ratio + fade-in as the live page */}
          {draft.heroImage && (
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 mb-10">
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]" />
              )}
              <img
                src={draft.heroImage}
                alt=""
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                  imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              />
            </div>
          )}

          {/* Body content, same type scale as the live article */}
          <div className="text-[17px] leading-[1.8] text-gray-800 min-w-0">
            <ContentFlowReadOnly blocks={draft.blocks} />
          </div>
        </div>
      </div>
    </div>
  );
}