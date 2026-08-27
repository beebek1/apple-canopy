import { useMemo, useState } from "react";
import { FiMessageCircle, FiShare2, FiArrowRight } from "react-icons/fi";
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
    date: "Jul 18",
    category: "Lifestyle",
    heading: "10 Websites Better Than Another Hour of Doomscrolling",
    excerpt:
      "Here's to the rabbit holes worth taking. We rounded up ten corners of the internet that reward curiosity instead of draining it, from archives of forgotten typefaces to a live map of every ship at sea.",
    image:
      "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=400&h=280&fit=crop",
    author: "Rafia Naseem",
    comments: 278,
  },
  {
    id: "a2",
    date: "Jul 17",
    category: "Travel",
    heading: "9 Countries That Make You A Citizen In Under A Year",
    excerpt:
      "Don't feel like waiting and have some cash to burn? You can gain citizenship in as little as 30 days through investment programs that most people don't even know exist.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=280&fit=crop",
    author: "Greyson Ferguson",
    comments: 112,
  },
  {
    id: "a3",
    date: "Jun 29",
    category: "Tech",
    heading: "You Only Have Weeks Left To Vibe Code",
    excerpt:
      "Then it's over. You better hurry up, because the tools that made improvisational programming feel like magic are quietly turning into something far more disciplined.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=280&fit=crop",
    author: "Michal Malewicz",
    comments: 244,
  },
  {
    id: "a4",
    date: "Jun 21",
    category: "Design",
    heading: "Why Every Great Interface Starts With A Bad Sketch",
    excerpt:
      "The first draft is never the point. It's the friction that gets you to the second one, and the third, until the shape finally stops fighting back.",
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=280&fit=crop",
    author: "Elena Voss",
    comments: 63,
  },
];

// ---------- Helpers ----------
function truncate(text: string, max = 150) {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "....";
}

export default function ArticleFeed() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Category");

  const filtered = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchesCategory =
        activeCategory === "All Category" || a.category === activeCategory;
      const matchesQuery = a.heading
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-white font-['Poppins',_sans-serif]">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col lg:flex-row-reverse gap-16">
        {/* ---------------- Main feed ---------------- */}
        <main className="flex-1 min-w-0">
          <div className="mb-9 flex items-end justify-between gap-4 border-b-2 border-gray-900 pb-4">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Art<span className="text-[#990200]">icles</span>
            </h1>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#11512a]">
              {filtered.length} {filtered.length === 1 ? "story" : "stories"}
            </span>
          </div>

          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 py-12 text-center">
              No articles match your search.
            </p>
          )}

          <div className="divide-y divide-gray-200">
            {filtered.map((article) => (
              <article
                key={article.id}
                className="group py-9 first:pt-0 flex flex-col-reverse sm:flex-row items-start justify-between gap-6"
              >
                {/* Text block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#990200] shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#11512a]">
                      {article.category}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-400">
                      {article.date}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2 cursor-pointer transition-colors group-hover:text-[#990200]">
                    {article.heading}
                  </h2>

                  <p className="text-sm text-gray-600 leading-relaxed mb-5">
                    {truncate(article.excerpt)}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-5 text-gray-500">
                      <span className="text-sm font-medium text-gray-700">
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm">
                        <FiMessageCircle className="w-4 h-4" />
                        {article.comments}
                      </span>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-sm bg-transparent hover:text-[#11512a] transition-colors cursor-pointer"
                      >
                        <FiShare2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#990200] bg-transparent underline underline-offset-4 decoration-[#990200]/40 hover:decoration-[#990200] hover:gap-2.5 transition-all cursor-pointer"
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
          </div>
        </main>

        {/* ---------------- Sidebar (filters) ---------------- */}
        <Sidebar
          query={query}
          onQueryChange={setQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>
    </div>
  );
}