import React, { useState } from "react";
import { FaShare as FaHeart} from "react-icons/fa";

interface Category {
  id: number;
  title: string;
  image: string;
  description: string;
  link: string;
  featured: boolean;
}

const CATEGORIES: Category[] = [
  {
    id: 1,
    title: "Tech & Startups",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=700&fit=crop",
    description:
      "Product launches, founder stories, and lessons from building in public.",
    link: "/categories/tech",
    featured: true,
  },
  {
    id: 2,
    title: "Sports",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=700&fit=crop",
    description:
      "Match breakdowns, athlete profiles, and takes on the games that matter.",
    link: "/categories/sports",
    featured: true,
  },
  {
    id: 3,
    title: "Education",
    image:
      "https://images.unsplash.com/photo-1427504494785-cdea4aa84e6e?w=600&h=700&fit=crop",
    description:
      "Study guides, campus stories, and writing from students and teachers.",
    link: "/categories/education",
    featured: true,
  },
  {
    id: 4,
    title: "Art & Music",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=700&fit=crop",
    description:
      "Reviews, artist interviews, and coverage of the culture worth following.",
    link: "/categories/art-music",
    featured: true,
  },
  {
    id: 5,
    title: "Community Voices",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=700&fit=crop",
    description: "Guest posts and stories from readers and local writers.",
    link: "/categories/community",
    featured: false,
  },
];

const FEATURED = CATEGORIES.filter((c) => c.featured).slice(0, 4);

function truncateWords(text: string, limit: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "...";
}

export default function CategoriesSection() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const toggleSaved = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="relative min-h-[820px] w-full overflow-hidden bg-white">

      {/* Curved SVG Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#990200" />
              <stop offset="50%" stopColor="#6d0605" />
              <stop offset="100%" stopColor="#5d0604" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L1440,0 L1440,780 Q1080,870 720,830 Q360,790 0,880 Z"
            fill="url(#redGradient)"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-8 pb-[150px] pt-[100px]">

        {/* Heading */}
        <div className="mb-14 text-center">
          <h2 className="mb-4 text-[clamp(2rem,4vw,3.25rem)] uppercase font-extrabold leading-[1.15] text-white">
            Ideas Worth Exploring
          </h2>
          <p className="mx-auto max-w-[650px] text-[1.05rem] font-normal text-white/75">
            Discover stories, ideas, and perspectives worth exploring
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">

          {FEATURED.map((cat) => {
            const isSaved = saved.has(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => (window.location.href = cat.link)}
                className="group relative h-[460px] cursor-pointer overflow-hidden rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              >
                {/* Image */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                />
                {/* Dark overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(15,10,10,0.96) 0%, rgba(15,10,10,0.82) 24%, rgba(15,10,10,0.35) 52%, rgba(15,10,10,0) 72%)",
                  }}
                />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 p-5">
                  <div>
                    <h3 className="mb-1.5 text-[1.15rem] font-bold leading-[1.2] text-white">
                      {cat.title}
                    </h3>
                    <p className="text-[0.8rem] leading-[1.5] text-white/70">
                      {truncateWords(cat.description, 8)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = cat.link;
                    }}
                    className="mt-1 w-full cursor-pointer rounded-full bg-white py-2.5 text-[0.82rem] font-bold tracking-wide text-[#2A0A12] transition-all duration-300 hover:bg-[#990200] hover:text-[#f4efe6] hover:shadow-[0_8px_20px_rgba(232,163,61,0.35)]"
                  >
                    Read More →
                  </button>
                </div>
              </div>
            );
          })}

          {/* See More Card */}
          <div
            onMouseEnter={() => setHovered(-1)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => (window.location.href = "/categories")}
            className={`group relative flex h-[460px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[28px] border transition-all duration-500 ease-out ${
              hovered === -1
                ? "border-white/30 bg-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
                : "border-white/20 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            }`}
          >
            {/* Subtle background glow */}
            <div
              className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl transition-opacity duration-500 ${
                hovered === -1 ? "opacity-100" : "opacity-40"
              }`}
            />

            {/* Bottom red glow */}
            <div
              className={`absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#990200]/25 blur-3xl transition-opacity duration-500 ${
                hovered === -1 ? "opacity-100" : "opacity-40"
              }`}
            />

            {/* Arrow circle */}
            <div className="relative z-10 flex h-[82px] w-[82px] items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            {/* Text */}
            <div className="relative z-10 mt-6 text-center">
              <p className="text-[1.15rem] font-bold tracking-tight text-white">
                Explore All Categories
              </p>

              <p className="mt-2 text-[0.8rem] text-white/60">
                Discover every topic we cover
              </p>

              {/* Hover line */}
              <div
                className={`mx-auto mt-4 h-[2px] rounded-full bg-white transition-all duration-500 ${
                  hovered === -1 ? "w-12 opacity-100" : "w-0 opacity-0"
                }`}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}