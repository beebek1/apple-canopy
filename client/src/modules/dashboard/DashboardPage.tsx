import { useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Environment from "../../assets/environment.png";
import StatsCounter from "./Components/StatsCounter";
import Blogs from "./Components/Blogs";
import FounderSection from "./Components/FounderInfo";
import { listPublicStatusesApi, getCurrentUserApi } from "./status.api"; // adjust path

const SLIDE_DURATION = 5000;

type Slide = {
  country: string;
  heading: string;
  image: string;
  slot: number;
  body?: string;
  bodyType?: "paragraph" | "quote";
};

export default function Hero() {
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Slides come entirely from the backend now — no dummy fallback.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listPublicStatusesApi();
        if (cancelled) return;
        setSlides(
          res.data.data
            .sort((a, b) => a.slot - b.slot)
            .map((s) => ({
              country: s.category,
              heading: s.heading,
              image: s.image,
              body: s.body,
              bodyType: s.bodyType,
              slot: s.slot,
            })),
        );
      } finally {
        if (!cancelled) setLoadingSlides(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Called directly here — a 200 means a valid JWT, a 401 throws and lands
  // in the catch. No separate hook, no role field to check.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await getCurrentUserApi();
        if (!cancelled) setIsAdmin(true);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (active >= slides.length) setActive(0);
    const timer = setTimeout(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [active, slides.length]);

  const current = slides[active];

  return (
    <div>
        <section className="w-full px-4 sm:px-6 md:px-10 lg:px-16 pt-6">
        <div className="relative w-full h-[500px] md:h-[620px] overflow-hidden rounded-lg font-poppins bg-gray-100">

            {loadingSlides ? (
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            ) : current ? (
              <>
                <img
                  src={current.image}
                  alt={current.country}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />

                {/* Edit signal — only rendered once checkAuthApi has come
                    back 200. Public visitors never see this. */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/status/${current.slot}`)}
                    title="Edit this status"
                    aria-label="Edit this status"
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-lg ring-1 ring-black/5 transition-all hover:bg-[#11512a] hover:text-white hover:shadow-xl active:scale-95 cursor-pointer"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}

                <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-12 text-white">
                  <p className="text-[13px] font-semibold tracking-widest uppercase mb-3">
                    {current.country}
                  </p>

                  <h1 className="text-[32px] sm:text-[44px] md:text-[60px] leading-[1.05] font-extrabold uppercase max-w-4xl mb-6">
                    {current.heading}
                  </h1>

                  {current.body && (
                    current.bodyType === "quote" ? (
                      <blockquote className="border-l-2 border-white/40 pl-4 max-w-2xl text-[15px] sm:text-lg italic text-white/85 mb-6">
                        "{current.body}"
                      </blockquote>
                    ) : (
                      <p className="max-w-2xl text-[14px] sm:text-base text-white/80 leading-relaxed mb-6">
                        {current.body}
                      </p>
                    )
                  )}

                  {slides.length > 1 && (
                    <div className="flex items-center gap-2 mt-10 max-w-2xl">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActive(index)}
                          className="relative flex-1 h-[3px] bg-white/30 overflow-hidden rounded-full cursor-pointer border-none"
                        >
                          {index === active && (
                            <span
                              key={active}
                              className="absolute left-0 top-0 h-full bg-white rounded-full animate-story-progress"
                              style={{ animationDuration: `${SLIDE_DURATION}ms` }}
                            />
                          )}
                          {index < active && (
                            <span className="absolute left-0 top-0 h-full w-full bg-white rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Real empty state, not fake placeholder content.
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
                <p className="text-sm font-medium">No stories posted yet</p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => navigate("/admin/status/1")}
                    className="text-xs font-semibold text-white bg-[#11512a] px-4 py-2 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Add the first one
                  </button>
                )}
              </div>
            )}
        </div>

        <style>{`
            @keyframes storyProgress {
            from { width: 0%; }
            to { width: 100%; }
            }
            .animate-story-progress {
            animation-name: storyProgress;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
            }
        `}</style>

        <div className="w-full min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 md:px-10 lg:px-16 py-16 sm:py-20 md:py-[130px]">
        <div className="relative z-10 w-full max-w-[1200px] min-h-0 md:min-h-[600px] flex flex-col justify-between gap-12 md:gap-0">

            {/* Top */}
            <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-[30px] md:pl-[60px]">

                <h1 className="font-poppins uppercase text-[2rem] sm:text-[2.5rem] md:text-[clamp(2.5rem,10vw,4rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#990200] text-center md:text-left w-full md:w-[45%] md:flex-none">
                    High altitude regions supply freshwater downstream
                </h1>

                <img
                    src={Environment}
                    alt="environment visualization"
                    className="w-auto h-auto max-w-[85%] sm:max-w-[70%] md:max-w-[2600px] max-h-[230px] sm:max-h-[280px] md:max-h-[400px] object-contain md:-translate-y-5"
                />
            </div>

            {/* Bottom */}
            <div className="w-full md:max-w-full ml-auto mt-0 md:mt-[70px] md:pr-[60px] text-center md:text-right">

            <h2 className="font-poppins text-[1.5rem] uppercase sm:text-[1.8rem] md:text-[clamp(2rem,8vw,3.5rem)] font-extrabold leading-[1.2] md:leading-[1.15] tracking-[-0.02em] text-[#11512a]">
                Climate threats force youth away, but apple trees generate local income while restoring mountain ecosystems
            </h2>

            </div>

        </div>
        </div>

        </section> 

        {/* Stats Counter */}
        <StatsCounter/>
        <FounderSection/>
        {/* <hr className="w-full border-t border-gray-300" /> */}
        <Blogs/>
    </div>
  );
}