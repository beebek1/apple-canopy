import { useState } from "react";
import { FiPlus } from "react-icons/fi";

const FAQS = [
  {
    q: "Where will the trees be planted?",
    a: "The first phase of Apple Canopy's planting project is planned for selected orchard areas in Mustang District, Nepal. The map shows our current planned planting areas.",
  },
  {
    q: "How many trees are planned?",
    a: "Our Phase 1 target is 10,000 trees across the planned orchard sites in Mustang.",
  },
  {
    q: "Are the trees shown on the map already planted?",
    a: "No. The map represents planned planting locations and projected tree distribution for the project. Actual locations will be updated as planting takes place.",
  },
  {
    q: "Why was Mustang chosen?",
    a: "Mustang has suitable areas for high-altitude fruit and native tree cultivation. The project aims to support local communities while increasing long-term green coverage.",
  },
  {
    q: "What happens to my donation?",
    a: "Apple Canopy aims to direct 100% of donations toward tree-planting activities, including seedlings, planting, local coordination, and related field operations.",
  },
  {
    q: "Can I see where my contribution goes?",
    a: "Yes. We aim to provide transparent project updates through the map, showing planting areas and progress as the project develops.",
  },
  {
    q: "When will planting begin?",
    a: "Planting will begin once the necessary site preparation, coordination, and resources are in place. The map currently represents the planned Phase 1 project, not completed planting.",
  },
];

function FaqItem({
  q,
  a,
  isOpen,
  onToggle,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex cursor-pointer items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm sm:text-[15px] font-medium text-white">{q}</span>
        <FiPlus
          className={`w-4 h-4 text-white/50 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-45" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-white/60 leading-relaxed pb-5 pr-8">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mt-16 max-w-2xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
        Frequently asked questions
      </h2>
      <div className="border-t border-white/10">
        {FAQS.map((item, i) => (
          <FaqItem
            key={item.q}
            q={item.q}
            a={item.a}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}