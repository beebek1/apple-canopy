import React from "react";
import founderPhoto from "../../../assets/DisplayImg.png";
import illustration from "../../../assets/HIll.jpeg";

export default function FounderSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white px-0 py-24">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-16 px-8 lg:grid-cols-2 lg:px-0">

        {/* Left: Founder photo + caption */}
        <div className="flex flex-col lg:pl-8">
          <div className="relative overflow-hidden rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
            <img
              src={founderPhoto}
              alt="Founder portrait"
              className="h-[380px] w-full object-cover"
            />
          </div>
          <div className="mt-6 ml-2">
            <h3 className="text-[1.4rem] font-bold text-[#11512a]">
              Ramesh Sharma
            </h3>
            <p className="mt-1 text-[0.85rem] font-semibold uppercase tracking-wide text-[#990200]">
              Founder &amp; Editor in Chief
            </p>
            <p className="mt-3 max-w-[420px] text-[0.9rem] leading-[1.6] text-[#4a3d3d]">
              Ramesh started this platform to give writers a place to publish
              honest work without the noise. He still edits every long form
              piece before it goes live.
            </p>
          </div>
        </div>

        {/* Right: Illustration, bleeds past top, bottom, and right edge */}
        <div className="pointer-events-none absolute -top-24 bottom-[-90px] -right-10 left-1/2 w-1/2">
        <img
            src={illustration}
            alt="Illustration"
            className="h-full w-full object-cover object-left"
        />
        </div>

      </div>
    </section>
  );
}