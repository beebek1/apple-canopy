import { useEffect, useRef, useState } from "react";

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

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

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
    <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
      <p className="whitespace-nowrap text-[28px] font-extrabold leading-none text-white sm:text-[40px] md:text-[52px]">
        {count.toLocaleString()}
        {suffix}
      </p>

      <p className="mt-2 max-w-[180px] text-[11px] leading-snug text-white/85 sm:text-[13px] md:text-[15px]">
        {label}
      </p>
    </div>
  );
}

export default function StatsCounter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
  <section
    ref={sectionRef}
    className="relative h-[120px] w-full overflow-hidden bg-[#11512a] sm:h-[160px] md:h-[150px]"
  >
    {/* Top fade */}

    {/* Stats */}
    <div className="relative z-10 mx-auto h-full max-w-[1200px] px-4 sm:px-6">
      <div className="flex h-full items-center divide-x divide-white/25">
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
    </div>

    {/* Bottom fade */}
  </section>
  );
}