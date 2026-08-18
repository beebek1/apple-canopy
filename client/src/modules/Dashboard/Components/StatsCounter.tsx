import React, { useEffect, useRef, useState } from "react";

const stats = [
  { value: 10000, suffix: "", label: "Trees Targeted" },
  { value: 100, suffix: "+", label: "Local Families to Benefit" },
  { value: 500, suffix: "+ Tons", label: "Projected Carbon Offset" },
];

function useCountUp(target: number, start: boolean, duration = 1800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    const frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [start, target, duration]);

  return value;
}

function StatItem({
  value,
  suffix,
  label,
  start,
}: {
  value: number;
  suffix: string;
  label: string;
  start: boolean;
}) {
  const count = useCountUp(value, start);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
      <p
        style={{ fontFamily: "'Poppins', sans-serif" }}
        className="text-[28px] sm:text-[40px] md:text-[52px] font-extrabold text-white leading-none whitespace-nowrap"
      >
        {count.toLocaleString()} {suffix}
      </p>
      <p
        style={{ fontFamily: "'Poppins', sans-serif" }}
        className="text-[11px] sm:text-[13px] md:text-[15px] text-white/80 mt-2 max-w-[180px] leading-snug"
      >
        {label}
      </p>
    </div>
  );
}

export default function StatsCounter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
      `}</style>
      <section
        ref={sectionRef}
        className="w-full my-30 h-[160px] sm:h-[200px] md:h-[240px] bg-[#11512a]"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-full flex flex-row items-center divide-x divide-white/20">
          {stats.map((stat) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              start={inView}
            />
          ))}
        </div>
      </section>
    </>
  );
}