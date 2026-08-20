import React, { useEffect, useState } from "react";
import Apple from "../../assets/apple.png";
import Placeholder1 from "../../assets/DisplayImg.png";
import Placeholder2 from "../../assets/DisplayImg.png";
import Placeholder3 from "../../assets/DisplayImg.png";
import StatsCounter from "./Components/StatsCounter";
import Blogs from "./Components/Blogs";
import founderSection from "./Components/FounderInfo";
import FounderSection from "./Components/FounderInfo";


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

        <div className="w-full min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 md:px-10 lg:px-16 py-16 sm:py-20 md:py-[130px]">
        <div className="relative z-10 w-full max-w-[1200px] min-h-0 md:min-h-[600px] flex flex-col justify-between gap-12 md:gap-0">

            {/* Top */}
            <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-[30px] md:pl-[60px]">

                <h1 className="font-poppins text-[2rem] sm:text-[2.5rem] md:text-[clamp(2.5rem,10vw,4rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#990200] text-center md:text-left w-full md:w-[45%] md:flex-none">
                    High altitude regions supply freshwater downstream
                </h1>

                <img
                    src={Apple}
                    alt="apple visualization"
                    className="w-auto h-auto max-w-[85%] sm:max-w-[70%] md:max-w-[2600px] max-h-[230px] sm:max-h-[280px] md:max-h-[400px] object-contain md:-translate-y-5"
                />
            </div>

            {/* Bottom */}
            <div className="w-full md:max-w-full ml-auto mt-0 md:mt-[70px] md:pr-[60px] text-center md:text-right">

            <h2 className="font-poppins text-[1.5rem] sm:text-[1.8rem] md:text-[clamp(2rem,8vw,3.5rem)] font-extrabold leading-[1.2] md:leading-[1.15] tracking-[-0.02em] text-[#11512a]">
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