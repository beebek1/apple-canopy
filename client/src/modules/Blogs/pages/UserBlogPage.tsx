import { useEffect, useMemo, useState } from "react";
import { FiMessageCircle, FiShare2, FiClock, FiArrowLeft, FiUser, FiCheck } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import CommentSection from "../components/CommentSection";
import ArticleBlocks from "../components/ArticleBlocks";
import { getPublicPostApi } from "../blog.api"; // adjust path
import type { PublicArticleDetail } from "../blog.types"; // adjust path

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Backend will eventually return this directly. For now, derive from block text.
function calculateReadTime(blocks: PublicArticleDetail["content"]): string {
  const text = blocks
    .map((b) => {
      if (b.type === "heading" || b.type === "paragraph") return b.text;
      if (b.type === "pullquote") return b.quote;
      if (b.type === "listicle") return `${b.title} ${b.description}`;
      return "";
    })
    .join(" ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-[760px] px-6 pt-12 pb-24 animate-pulse">
      <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
      <div className="h-4 w-20 bg-gray-100 rounded-full mb-5" />
      <div className="h-12 w-11/12 bg-gray-100 rounded mb-3" />
      <div className="h-12 w-2/3 bg-gray-100 rounded mb-6" />
      <div className="h-6 w-3/4 bg-gray-100 rounded mb-8" />
      <div className="flex items-center gap-3 pb-8 mb-8 border-b border-gray-200">
        <div className="w-11 h-11 rounded-full bg-gray-100" />
        <div className="space-y-2">
          <div className="h-3.5 w-28 bg-gray-100 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="w-full aspect-[16/9] rounded-lg bg-gray-100 mb-10" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-5/6 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function ArticlePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [article, setArticle] = useState<PublicArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [progress, setProgress] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await getPublicPostApi(id);
        if (!cancelled) setArticle(res.data.data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const readTime = useMemo(
    () => (article ? calculateReadTime(article.content) : ""),
    [article],
  );

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard access denied or unavailable, ignore.
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  function toggleComments() {
    setCommentsOpen((prev) => !prev);
  }

  useEffect(() => {
    function handleScroll() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-['Poppins',_sans-serif] overflow-x-clip">
        <ArticleSkeleton />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-white font-['Poppins',_sans-serif] flex flex-col items-center justify-center px-6">
        <p className="text-gray-500 mb-4">This article couldn't be found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-[#11512a] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Poppins',_sans-serif] overflow-x-clip">
      <div className="fixed top-[95px] left-0 w-full h-[3px] bg-gray-100 z-40">
        <div
          className="h-full bg-[#11512a] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className={`transition-transform duration-300 ease-out ${
          commentsOpen ? "md:-translate-x-[210px]" : "translate-x-0"
        }`}
      >
        <div className="mx-auto max-w-[760px] px-6 pt-12 pb-24">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#11512a]"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Articles
          </button>

          <div className="flex items-center gap-2 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#990200] shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#11512a]">
              {article.category}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-5">
            {article.title}
          </h1>

          <p className="text-xl text-gray-500 leading-relaxed mb-8">{article.dek}</p>

          <div className="flex items-center gap-3 pb-8 mb-8 border-b border-gray-200">
            <span className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <FiUser className="w-5 h-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{article.author.username}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
                <span>•</span>
                <FiClock className="w-3.5 h-3.5" />
                <span>{readTime}</span>
              </div>
            </div>
          </div>

          {article.heroImage && (
            <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 mb-10">
              <img
                src={article.heroImage}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="text-[17px] leading-[1.8] text-gray-800 min-w-0">
            <ArticleBlocks blocks={article.content} />
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 flex flex-col gap-3 transition-transform duration-300 ease-out ${
          commentsOpen ? "md:-translate-x-[420px]" : "translate-x-0"
        }`}
      >
        <button
          type="button"
          onClick={toggleComments}
          title="Comments"
          className={`relative w-12 h-12 md:w-13 md:h-13 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer ${
            commentsOpen
              ? "bg-[#11512a] text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-[#11512a] hover:text-[#11512a]"
          }`}
        >
          <FiMessageCircle className="w-5 h-5" />
          {!commentsOpen && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#990200] text-white text-[10px] font-semibold flex items-center justify-center">
              {article._count.comments}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={handleShare}
          title="Share"
          className={`w-12 h-12 md:w-13 md:h-13 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer ${
            shared
              ? "bg-[#11512a] text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-[#11512a] hover:text-[#11512a]"
          }`}
        >
          {shared ? <FiCheck className="w-5 h-5" />  : <FiShare2 className="w-5 h-5" />}
        </button>
      </div>

      <CommentSection postId={article.id} isOpen={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </div>
  );
}