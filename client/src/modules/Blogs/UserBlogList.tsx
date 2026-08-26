import { useEffect, useMemo, useRef, useState } from "react";
import { FiMessageCircle, FiShare2, FiArrowRight, FiFilter } from "react-icons/fi";
import Sidebar from "./components/Sidebar";

// ---------- Types ----------
interface Article {
  id: string;
  date: string;
  category: string;
  heading: string;
  excerpt: string;
  image: string;
  author: string;
  comments: number;
}

// ---------- Dummy data (backend will replace this) ----------
const ARTICLES: Article[] = [
  {
    id: "a1",
    date: "Aug 18",
    category: "Forests",
    heading: "Inside The Push To Restore India's Vanishing Mangroves",
    excerpt:
      "Along the coast, community nurseries are replanting mangrove belts that once buffered entire villages from storm surge, one seedling at a time.",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=280&fit=crop",
    author: "Rafia Naseem",
    comments: 41,
  },
  {
    id: "a2",
    date: "Aug 15",
    category: "Wildlife",
    heading: "Camera Traps Reveal A Leopard Population Nobody Knew Existed",
    excerpt:
      "A three-year survey across a disputed forest corridor turned up something researchers didn't expect to find intact.",
    image:
      "https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=400&h=280&fit=crop",
    author: "Greyson Ferguson",
    comments: 87,
  },
  {
    id: "a3",
    date: "Aug 9",
    category: "Climate",
    heading: "What A 1.5 Degree World Actually Looks Like For Farmers",
    excerpt:
      "Notes from a season spent with smallholder farmers adapting planting calendars to a shifting monsoon.",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=280&fit=crop",
    author: "Michal Malewicz",
    comments: 12,
  },
  {
    id: "a4",
    date: "Aug 4",
    category: "Plantation",
    heading: "The Quiet Economics Of A Community-Owned Teak Plantation",
    excerpt:
      "A cooperative of 40 families is proving that a managed plantation can outperform a logging concession over 20 years.",
    image:
      "https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=400&h=280&fit=crop",
    author: "Elena Voss",
    comments: 6,
  },
];

const PAGE_SIZE = 5;
const FILTER_DELAY_MS = 400; // simulated fetch latency for the skeleton state
const LOAD_MORE_DELAY_MS = 400;

// ---------- Helpers ----------
function truncate(text: string, max = 150) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "....";
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

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false); // filter/search/sort changed, refetching from top
  const [loadingMore, setLoadingMore] = useState(false); // appending the next page

  const isFirstRun = useRef(true);

  const filtered = useMemo(() => {
    const result = ARTICLES.filter((a) => {
      const matchesCategory =
        activeCategory === "All Category" || a.category === activeCategory;
      const matchesQuery = a.heading
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
    // ARTICLES is already newest-first, so reverse for oldest-first
    return sortOrder === "newest" ? result : [...result].reverse();
  }, [query, activeCategory, sortOrder]);

  // Whenever the search, category, or sort changes, show a skeleton and reset
  // pagination back to the first page, as if refetching from the server.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setLoading(true);
    setVisibleCount(PAGE_SIZE);
    const timer = setTimeout(() => setLoading(false), FILTER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query, activeCategory, sortOrder]);

  function handleLoadMore() {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setLoadingMore(false);
    }, LOAD_MORE_DELAY_MS);
  }

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="min-h-screen bg-white font-['Poppins',_sans-serif]">
      {/* Header band — matches the admin dashboard's site identity */}
      <div
        className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-10"
        style={{
          background: "linear-gradient(135deg, #7a0a0a 0%, #680505 55%, #4a0303 100%)",
        }}
      >
        {/* Decorative background pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Soft glow accent */}
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
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col lg:flex-row-reverse gap-16">
        {/* ---------------- Main feed ---------------- */}
        <main className="flex-1 min-w-0">
          {/* Mobile filter trigger, opens the Sidebar as a slide-in drawer */}
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

          {loading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ArticleSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {filtered.length === 0 && (
                <p className="text-sm text-gray-400 py-12 text-center">
                  No articles match your search.
                </p>
              )}

              <div className="divide-y divide-gray-100">
                {displayed.map((article) => (
                  <article
                    key={article.id}
                    className="group py-8 first:pt-0 flex flex-col-reverse sm:flex-row items-start justify-between gap-6"
                  >
                    {/* Text block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#680505] shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#11512a]">
                          {article.category}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-400">
                          {article.date}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug mb-1.5 cursor-pointer transition-colors group-hover:text-[#680505]">
                        {article.heading}
                      </h2>

                      <p className="text-sm text-gray-500 leading-relaxed mb-4">
                        {truncate(article.excerpt)}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span className="text-xs font-medium text-gray-700">
                            {article.author}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <FiMessageCircle className="w-3.5 h-3.5" />
                            {article.comments}
                          </span>
                          <button
                            type="button"
                            className="flex items-center gap-1.5 text-xs bg-transparent hover:text-[#11512a] transition-colors cursor-pointer"
                          >
                            <FiShare2 className="w-3.5 h-3.5" />
                            Share
                          </button>
                        </div>

                        <button
                          type="button"
                          className="flex items-center gap-1.5 text-sm font-semibold text-[#680505] bg-transparent underline underline-offset-4 decoration-[#680505]/40 hover:decoration-[#680505] hover:gap-2.5 transition-all cursor-pointer"
                        >
                          Read more
                          <FiArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="w-full sm:w-40 h-40 sm:h-28 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      <img
                        src={article.image}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </article>
                ))}

                {loadingMore &&
                  Array.from({ length: Math.min(PAGE_SIZE, filtered.length - visibleCount) }).map(
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