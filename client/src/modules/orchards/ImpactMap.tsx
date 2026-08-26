import { useMemo } from "react";
import { PiTreePalmFill } from "react-icons/pi";
import MustangOrchardMap, { ORCHARD_ZONES } from "./components/Map";
import Faq from "./components/Faq";

export default function ImpactMap() {
  const totals = useMemo(() => {
    const treesPlanted = ORCHARD_ZONES.reduce((sum, z) => sum + z.trees.length, 0);
    const targetTrees = ORCHARD_ZONES.reduce((sum, z) => sum + z.targetTrees, 0);
    const matureTrees = 1000;
    return { treesPlanted, targetTrees, matureTrees, zones: ORCHARD_ZONES.length };
  }, []);

  return (
    <div className="font-['Poppins',_sans-serif] bg-[#11512a] text-white">
      {/* Hero */}
      <div className="px-6 pt-16 pb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight max-w-2xl mx-auto mb-4">
          Know that your donation is making a difference
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Apple Canopy puts 100% of your donation into planting trees in Mustang district, then
          shows you exactly where it went, down to the coordinates.
        </p>
      </div>

      {/* Stats bar */}
      <div className="border-t border-white/10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[#ffffff] flex items-center justify-center shrink-0">
              <PiTreePalmFill className="w-5 h-5 text-[#11512a]" />
            </span>
            <div>
              <p className="text-lg font-semibold">Apple Canopy</p>
              <p className="text-xs text-gray-400">Last updated: August 20, 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-xl font-semibold">{totals.treesPlanted.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Dot Marked</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">{totals.zones.toLocaleString()}</p>
              <p className="text-xs text-gray-400">orchard sites</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">{totals.matureTrees.toLocaleString()}+</p>
              <p className="text-xs text-gray-400">Trees Planned for Phase 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map + FAQ */}
      <div className="relative pt-6 pb-16 px-6 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #11512a 0%, #0a3b1d 35%, #680505 55%, #680505 100%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <MustangOrchardMap />
          <hr className="border-0 border-t mt-10 border-white/10" />
          <Faq />
        </div>
      </div>
    </div>
  );
}