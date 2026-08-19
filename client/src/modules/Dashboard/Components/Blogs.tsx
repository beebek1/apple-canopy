import React, { useState } from "react";

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
    title: "Corporate Social",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=700&fit=crop",
    description:
      "Partner with us on CSR initiatives and team-driven fundraising campaigns.",
    link: "/categories/corporate",
    featured: true,
  },
  {
    id: 2,
    title: "Sports Teams",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=700&fit=crop",
    description:
      "Fundraising for athletes, teams, tournaments and competitions.",
    link: "/categories/sports",
    featured: true,
  },
  {
    id: 3,
    title: "Schools",
    image:
      "https://images.unsplash.com/photo-1427504494785-cdea4aa84e6e?w=600&h=700&fit=crop",
    description:
      "Support students, educators, and school-wide programs that matter.",
    link: "/categories/schools",
    featured: true,
  },
  {
    id: 4,
    title: "Art & Music",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=700&fit=crop",
    description:
      "Back creative artists, performers, and cultural community events.",
    link: "/categories/art-music",
    featured: true,
  },
  {
    id: 5,
    title: "Fiscal Sponsors",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=700&fit=crop",
    description: "Empower nonprofits and community organizations to grow.",
    link: "/categories/fiscal",
    featured: false,
  },
];

const FEATURED = CATEGORIES.filter((c) => c.featured).slice(0, 4);

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
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
    <section className="relative min-h-[820px] w-full overflow-hidden bg-white font-[Poppins,sans-serif]">

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
              <stop offset="50%" stopColor="#7D0303" />
              <stop offset="100%" stopColor="#4F0101" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q360,20 720,70 Q1080,120 1440,35 L1440,780 Q1080,870 720,830 Q360,790 0,880 Z"
            fill="url(#redGradient)"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-8 pb-[150px] pt-[100px]">

        {/* Heading */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-[3px] text-white/70">
            Get involved
          </p>
          <h2 className="mb-4 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.15] text-white">
            Ways to Make an Impact
          </h2>
          <p className="mx-auto max-w-[650px] text-[1.05rem] font-normal text-white/75">
            Pick the cause that speaks to you and start making a difference today.
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
                {/* Bookmark */}
                <button
                  onClick={(e) => toggleSaved(cat.id, e)}
                  aria-label="Save category"
                  className={`absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors duration-200 ${
                    isSaved
                      ? "bg-[#E8A33D] text-[#2A0A12]"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <BookmarkIcon filled={isSaved} />
                </button>
                {/* Curved bottom */}
                <div className="absolute bottom-[-1px] left-[-10%] z-10 h-[110px] w-[120%] rounded-[50%_50%_0_0/100%_100%_0_0] bg-[#990200]" />
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 p-5">
                  <div>
                    <h3 className="mb-1.5 text-[1.15rem] font-bold leading-[1.2] text-white">
                      {cat.title}
                    </h3>
                    <p className="text-[0.8rem] leading-[1.5] text-white/70">
                      {cat.description}
                    </p>
                  </div>
                  {/* Button only highlights when button itself is hovered */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = cat.link;
                    }}
                    className="mt-1 w-full rounded-full bg-white py-2.5 text-[0.82rem] font-bold tracking-wide text-[#2A0A12] transition-all duration-300 hover:bg-[#E8A33D] hover:shadow-[0_8px_20px_rgba(232,163,61,0.35)]"
                  >
                    Explore Stories →
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
            className={`flex h-[460px] cursor-pointer flex-col items-center justify-center gap-5 rounded-[28px] transition-all duration-300 ease-in-out ${
              hovered === -1
                ? "-translate-y-2 bg-white/20 shadow-[0_32px_64px_rgba(0,0,0,0.3)]"
                : "bg-black/20 shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
            }`}
          >
            {/* Arrow circle */}
            <div
              className={`flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 transition-all duration-300 ${
                hovered === -1 ? "border-white bg-white/20 scale-110" : "border-white/40"
              }`}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            <div className="text-center">
              <p className="text-[1.05rem] font-bold text-white">See All Categories</p>
              <p className="mt-1 text-[0.78rem] text-white/60">Browse everything we support</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}