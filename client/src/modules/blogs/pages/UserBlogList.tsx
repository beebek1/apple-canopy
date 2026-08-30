import { useEffect, useRef, useState } from "react";
import { FiMessageCircle, FiShare2, FiArrowRight, FiFilter, FiCheck } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import { listPublicPostsApi } from "../blog.api"; // adjust path
import type { PublicArticle } from "../blog.types"; // adjust path
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;

function truncate(text: string, max = 150) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "....";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ArticleSkeleton() {
  return (
    <div className="py-8 first:pt-0 flex flex-col-reverse sm:flex-row items-start justify-between gap-6 animate-pulse">
      <div className="flex-1 min-w-0 space-y-3">
        <div className="h-3 w-24 bg-gray-200 rounded-full" />
        <div className="h-5 w-3/4 bg-gray-200 rounded-md" />
        <div className="h-4 w-full bg-gray-100 rounded-md" />
        <div className="h-4 w-5/6 bg-gray-100 rounded-md" />
        <div className="flex items-center gap-4 pt-2">
          <div className="h-3.5 w-20 bg-gray-200 rounded-full" />
          <div className="h-3.5 w-12 bg-gray-200 rounded-full" />
          <div className="h-3.5 w-16 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="w-full sm:w-40 h-40 sm:h-28 shrink-0 rounded-md bg-gray-200" />
    </div>
  );
}

export default function ArticleFeed() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Category");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [articles, setArticles] = useState<PublicArticle[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(true); // filter/search/sort changed, refetching from top
  const [loadingMore, setLoadingMore] = useState(false); // appending the next page
  const [error, setError] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Guards so the "filters changed" effect doesn't double-fire on mount
  const navigate = useNavigate();

  const isFirstRun = useRef(true);

  async function fetchArticles(targetPage: number, append: boolean) {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await listPublicPostsApi({
        category: activeCategory,
        search: query || undefined,
        sort: sortOrder,
        page: targetPage,
        limit: PAGE_SIZE,
      });
      const data = res.data.data;
      setArticles((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setTotal(data.pagination.total);
      setHasMore(data.pagination.hasMore);
      setPage(targetPage);
    } catch {
      setError("Couldn't load articles. Try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Refetch from page 1 whenever a filter changes (debounced for the search box).
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      fetchArticles(1, false);
      return;
    }
    const timer = setTimeout(() => fetchArticles(1, false), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory, sortOrder]);

  function handleLoadMore() {
    fetchArticles(page + 1, true);
  }

  function handleReadMore(id: string) {
    navigate(`/blogs/${id}`);
  }

  async function handleShare(id: string) {
    const url = `${window.location.origin}/blogs/${id}`;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      setError("Couldn't copy the link. Try copying it manually.");
      return;
    }

    if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    setSharedId(id);
    shareTimerRef.current = setTimeout(() => setSharedId(null), 2000);
  }

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-['Poppins',_sans-serif]">
      {/* Header band */}
      <div
        className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #7a0a0a 0%, #680505 55%, #4a0303 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: "#11512a" }}
        />

        <div className="relative mx-auto max-w-6xl flex items-end justify-between gap-4 pl-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold uppercase text-white tracking-tight">
              Articles
            </h1>
            <p className="mt-1.5 text-sm text-white/70 max-w-md">
              Stories from the ground on forests, wildlife, and the people working to protect them.
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
            {total} {total === 1 ? "article" : "articles"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col lg:flex-row-reverse gap-16">
        {/* ---------------- Main feed ---------------- */}
        <main className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden mb-6 w-full flex items-center justify-between text-sm rounded-full border border-gray-200 bg-white py-2.5 px-4 text-gray-600 hover:border-[#11512a] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FiFilter className="w-4 h-4" />
              Filters
            </span>
            <span className="text-xs text-gray-400 truncate max-w-[160px]">
              {activeCategory}
              {query ? ` • "${query}"` : ""}
            </span>
          </button>

          {error && (
            <div className="text-sm text-[#680505] bg-red-50 rounded-md px-4 py-2.5 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ArticleSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {articles.length === 0 && (
                <p className="text-sm text-gray-400 py-12 text-center">
                  No articles match your search.
                </p>
              )}

              <div className="divide-y divide-gray-100">
                {articles.map((article) => (
                  <article
                    key={article.id}
                    className="group py-8 first:pt-0 flex flex-col-reverse sm:flex-row items-start justify-between gap-6"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#680505] shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#11512a]">
                          {article.category}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>

                      <button 
                        onClick={()=> handleReadMore(article.id)}
                        className="text-base sm:text-lg font-semibold text-gray-900 leading-snug mb-1.5 cursor-pointer transition-colors group-hover:text-[#680505]">
                        {article.title}
                      </button>

                      <p className="text-sm text-gray-500 leading-relaxed mb-4">
                        {truncate(article.dek)}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span className="text-xs font-medium text-gray-700">
                            {article.author.name}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <FiMessageCircle className="w-3.5 h-3.5" />
                            {article._count.comments}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleShare(article.id)}
                            className="flex items-center gap-1.5 text-xs bg-transparent hover:text-[#11512a] transition-colors cursor-pointer"
                          >
                            {sharedId === article.id ? (
                              <>
                                <FiCheck className="w-3.5 h-3.5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <FiShare2 className="w-3.5 h-3.5" />
                                Share
                              </>
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleReadMore(article.id)}
                          className="flex items-center gap-1.5 text-sm font-semibold text-[#680505] bg-transparent underline underline-offset-4 decoration-[#680505]/40 hover:decoration-[#680505] hover:gap-2.5 transition-all cursor-pointer"
                        >
                          Read more
                          <FiArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="w-full sm:w-40 h-40 sm:h-28 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {article.heroImage && (
                        <img
                          src={article.heroImage}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>
                  </article>
                ))}

                {loadingMore &&
                  Array.from({ length: Math.min(PAGE_SIZE, total - articles.length) }).map(
                    (_, i) => <ArticleSkeleton key={`more-${i}`} />
                  )}
              </div>

              {hasMore && !loadingMore && (
                <div className="pt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    style={{ backgroundColor: "#11512a" }}
                    className="text-sm font-semibold text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* ---------------- Sidebar (filters) ---------------- */}
        <Sidebar
          query={query}
          onQueryChange={setQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          sortOrder={sortOrder}
          onSortChange={() =>
            setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
          }
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
      </div>
    </div>
  );
}