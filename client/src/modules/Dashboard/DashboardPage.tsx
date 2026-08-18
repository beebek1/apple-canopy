import React, { useEffect, useState } from "react";
import Placeholder1 from "../../assets/DisplayImg.png";
import Placeholder2 from "../../assets/DisplayImg.png";
import Placeholder3 from "../../assets/DisplayImg.png";
import StatsCounter from "./Components/StatsCounter";

const SLIDE_DURATION = 5000;

const dummySlides = [
  {
    country: "CANADA",
    heading: "PROJECT OHAHODODOYH ʼGYE? TSĘH OHNEGAG̱HDĘGYO",
    image: Placeholder1,
  },
  {
    country: "MEXICO",
    heading: "PROJECT NAME GOES HERE",
    image: Placeholder2,
  },
  {
    country: "PERU",
    heading: "PROJECT NAME GOES HERE",
    image: Placeholder3,
  },
];

type Slide = {
  country: string;
  heading: string;
  image: string;
};

export default function Hero({ slides = dummySlides }: { slides?: Slide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setTimeout(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [active, slides.length]);

  return (
    <div>
        <section className="w-full px-4 sm:px-6 md:px-10 lg:px-16 pt-6">
        <div className="relative w-full h-[500px] md:h-[620px] overflow-hidden rounded-lg font-poppins">
            <img
            src={slides[active].image}
            alt={slides[active].country}
            className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/45" />

            <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-12 text-white">
            <p className="text-[13px] font-semibold tracking-widest uppercase mb-3">
                {slides[active].country}
            </p>

            <h1 className="text-[32px] sm:text-[44px] md:text-[60px] leading-[1.05] font-extrabold uppercase max-w-4xl mb-6">
                {slides[active].heading}
            </h1>

            <a
                href="#"
                className="inline-flex items-center gap-2 text-[15px] font-medium uppercase tracking-wider text-white/80 hover:text-white transition-colors duration-300"
            >
                More information
                <span className="translate-y-[1px]">→</span>
            </a>

            {slides.length > 1 && (
                <div className="flex items-center gap-2 mt-10 max-w-2xl">
                {slides.map((slide, index) => (
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

            <div>
                
            </div>
        </section> 

     {/* Stats Counter */}
        <StatsCounter/>
    </div>
  );
}