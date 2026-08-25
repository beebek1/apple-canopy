import { useEffect, useMemo, useState } from "react";
import { FiMessageCircle, FiShare2, FiClock, FiArrowLeft, FiUser, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import CommentSection from "./components/CommentSection";

interface ListItem {
  number: string;
  title: string;
  text: string;
}

interface Article {
  id: string;
  category: string;
  heading: string;
  dek: string;
  date: string;
  author: {
    name: string;
  };
  heroImage: string;
  commentCount: number;
  body: string[];
  pullQuote: string;
}

// Dummy data. Backend will replace this with the real article payload.
const ARTICLE: Article = {
  id: "a1",
  category: "Lifestyle",
  heading: "10 Websites Better Than Another Hour of Doomscrolling",
  dek: "The rabbit holes worth taking. Ten corners of the internet that reward curiosity instead of draining it.",
  date: "Jul 18",
  author: {
    name: "Rafia Naseem",
  },
  heroImage:
    "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1400&h=800&fit=crop",
  commentCount: 278,
  body: [
    "Here's to the rabbit holes worth taking. The internet rewards scale, the same six apps, the same infinite feed, the same dopamine loop dressed up in a new color scheme. Underneath all of that is still the strange, sprawling library it always was. These ten sites prove curiosity still has somewhere to go.",
    "None of these are productivity tools. They won't organize your calendar or summarize your inbox. What they offer instead is closer to what a good bookstore does, a shelf you didn't know you needed, arranged by someone who loves the subject more than an algorithm ever could.",
    "A few of these have been online for over a decade, maintained by people who never chased growth. Others are newer, built by small teams who wanted a version of the web that felt less like a feed and more like a room you could wander around in. Here are three to start with.",
    "None of this argues against scrolling, sometimes a feed is exactly what the moment calls for. It's a reminder that the internet is still big enough to get lost in on purpose, if you know where to start looking.",
  ],
  pullQuote:
    "The best corners of the internet aren't the ones optimized to keep you. They're the ones that let you leave with something.",
};

const LIST_ITEMS: ListItem[] = [
  {
    number: "01",
    title: "The Public Domain Review",
    text: "An archive of art, illustration, and writing that's aged out of copyright. Engravings of deep-sea creatures, forgotten alphabets, and diagrams that look more like dreams than science.",
  },
  {
    number: "02",
    title: "MarineTraffic",
    text: "A live map of nearly every commercial ship on the ocean right now. Zoom into a random shipping lane at 3am and there's something quietly grounding about it.",
  },
  {
    number: "03",
    title: "Fonts In Use",
    text: "A catalogue of real-world typography, packaging, signage, book covers, tagged and searchable, for when you want to know exactly why a design worked.",
  },
];

// Backend will return average reading speed and word count directly.
// For now, calculate it from the body content.
function calculateReadTime(paragraphs: string[], extra: string[] = []): string {
  const text = [...paragraphs, ...extra].join(" ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

export default function ArticlePage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const readTime = useMemo(
    () => calculateReadTime(ARTICLE.body, [ARTICLE.pullQuote]),
    []
  );

  async function handleShare() {
    // Backend will provide the canonical article URL. Falls back to current location for now.
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

  return (
    <div className="min-h-screen bg-white font-['Poppins',_sans-serif] overflow-x-hidden">
      {/* Reading progress bar, sits just under the fixed 95px navbar */}
      <div className="fixed top-[95px] left-0 w-full h-[3px] bg-gray-100 z-40">
        <div
          className="h-full bg-[#11512a] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content only shifts sideways on desktop, where the panel floats beside it.
          On mobile the panel is a full-screen sheet, so nothing needs to move. */}
      <div
        className={`transition-transform duration-300 ease-out ${
          commentsOpen ? "md:-translate-x-[210px]" : "translate-x-0"
        }`}
      >
      <div className="mx-auto max-w-[760px] px-6 pt-12 pb-24">
        {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#11512a]"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to Articles
      </button>

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#990200] shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#11512a]">
            {ARTICLE.category}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-[1.15] tracking-tight mb-5">
          {ARTICLE.heading}
        </h1>

        {/* Dek */}
        <p className="text-xl text-gray-500 leading-relaxed mb-8">{ARTICLE.dek}</p>

        {/* Byline row */}
        <div className="flex items-center gap-3 pb-8 mb-8 border-b border-gray-200">
          <span className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
            <FiUser className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{ARTICLE.author.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>{ARTICLE.date}</span>
              <span>•</span>
              <FiClock className="w-3.5 h-3.5" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>

        {/* Hero image */}
        <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 mb-10">
          <img src={ARTICLE.heroImage} alt="" className="w-full h-full object-cover" />
        </div>

        {/* ---------------- Body ---------------- */}
        <div className="flex gap-8">
          {/* Article text */}
          <div className="text-[17px] leading-[1.8] text-gray-800 min-w-0">
            <p className="mb-6">{ARTICLE.body[0]}</p>
            <p className="mb-6">{ARTICLE.body[1]}</p>

            <blockquote className="border-l-2 border-[#990200] pl-6 my-10 text-2xl leading-snug text-gray-900 font-medium">
              {ARTICLE.pullQuote}
            </blockquote>

            <p className="mb-10">{ARTICLE.body[2]}</p>

            {/* Listicle section */}
            <div className="space-y-10 mb-10">
              {LIST_ITEMS.map((item) => (
                <div key={item.number}>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-sm font-bold text-[#990200]">{item.number}</span>
                    <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>

            <p className="mb-6">{ARTICLE.body[3]}</p>
          </div>
        </div>
      </div>
      </div>

      {/* Floating action cluster, comment and share. Floats on every screen size.
          On desktop it slides left out from behind the comment panel when open,
          so it stays visible and reachable instead of getting buried under it. */}
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
              {ARTICLE.commentCount}
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
          {shared ? <FiCheck className="w-5 h-5" /> : <FiShare2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Comment modal, right side on desktop, full-screen sheet on mobile */}
      <CommentSection isOpen={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </div>
  );
}