import { useState } from "react";

import SessionsPanel from "../../admin/components/SessionsTab";
import DonationsPanel from "../components/DonationPanel";

type Tab = "sessions" | "donations";

export default function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("donations");

  return (
    <div className="w-full px-7 sm:px-6 md:px-10 lg:px-16 py-8 pb-110 font-['Poppins',_sans-serif]">
      <hr className="border-gray-200 pb-1" />
      <hr className="border-gray-200 pb-4" />

      <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("donations")}
          className={`px-4 py-2 text-sm font-semibold cursor-pointer border-b-2 -mb-px transition-colors ${
            activeTab === "donations"
              ? "border-[#ff5a1f] text-[#ff5a1f]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Donations
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2 text-sm font-semibold cursor-pointer border-b-2 -mb-px transition-colors ${
            activeTab === "sessions"
              ? "border-[#ff5a1f] text-[#ff5a1f]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Sessions
        </button>
      </div>

      {activeTab === "donations" ? <DonationsPanel /> : <SessionsPanel />}
    </div>
  );
}