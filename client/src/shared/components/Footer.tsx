import React, { useState } from "react";

const footerColumns = [
  {
    title: "The Foundation",
    links: ["Our Mission", "Our Approach", "Our Projects", "Our Impact", "Stories"],
  },
  {
    title: "Events",
    links: ["Events & Campaigns", "Upcoming Initiatives", "Past Initiatives"],
  },
  {
    title: "Corporate Information",
    links: ["Governance", "Contact", "Team"],
  },
];

const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

interface SubscribeFormState {
  firstName: string;
  lastName: string;
  email: string;
  month: string;
  day: string;
  year: string;
  reminder: boolean;
}

function SubscribeForm() {
  const [form, setForm] = useState<SubscribeFormState>({
    firstName: "",
    lastName: "",
    email: "",
    month: "",
    day: "",
    year: "",
    reminder: false,
  });

  function updateField(field: keyof SubscribeFormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubscribe() {
    console.log("Subscribe payload", form);
  }

  return (
    <div className="max-w-[450px] w-full">
      <div className="grid grid-cols-2 gap-6 mb-5">
        <div>
          <label className="block text-[11px] font-semibold tracking-wide text-[#11512a] mb-1">
            FIRST NAME
          </label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            className="w-full border border-[#d8d8d8] rounded px-3 py-2 text-[14px] text-[#11512a] focus:outline-none focus:border-[#11512a] transition-colors duration-300"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold tracking-wide text-[#11512a] mb-1">
            LAST NAME
          </label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            className="w-full border border-[#d8d8d8] rounded px-3 py-2 text-[14px] text-[#11512a] focus:outline-none focus:border-[#11512a] transition-colors duration-300"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[11px] font-semibold tracking-wide text-[#11512a] mb-1">
          EMAIL
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="w-full border border-[#d8d8d8] rounded px-3 py-2 text-[14px] text-[#11512a] focus:outline-none focus:border-[#11512a] transition-colors duration-300"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[11px] font-semibold tracking-wide text-[#11512a] mb-1">
          BIRTHDAY (OPTIONAL)
        </label>
        <div className="grid grid-cols-3 gap-4">
          <select
            value={form.month}
            onChange={(e) => updateField("month", e.target.value)}
            className="border border-[#d8d8d8] rounded px-2 py-2 text-[14px] text-[#11512a] bg-white focus:outline-none focus:border-[#11512a]"
          >
            <option value="">MM</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={form.day}
            onChange={(e) => updateField("day", e.target.value)}
            className="border border-[#d8d8d8] rounded px-2 py-2 text-[14px] text-[#11512a] bg-white focus:outline-none focus:border-[#11512a]"
          >
            <option value="">DD</option>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={form.year}
            onChange={(e) => updateField("year", e.target.value)}
            className="border border-[#d8d8d8] rounded px-2 py-2 text-[14px] text-[#11512a] bg-white focus:outline-none focus:border-[#11512a]"
          >
            <option value="">YYYY</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-start gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={form.reminder}
          onChange={(e) => updateField("reminder", e.target.checked)}
          className="mt-1 w-4 h-4 accent-[#11512a]"
        />
        <span className="text-[11px] font-semibold tracking-wide text-[#9aa3b5]">
          SET A REMINDER TO PLEDGE MY BIRTHDAY AND HELP CHANGE LIVES
        </span>
      </label>

      <button
        onClick={handleSubscribe}
        className="w-full bg-[#11512a] text-[#f4efe6] px-6 py-3 text-[14px] font-semibold rounded cursor-pointer hover:bg-[#023E1A] transition-colors duration-300"
      >
        SUBSCRIBE
      </button>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-white font-poppins">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-20 py-9">
        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          <div className="flex flex-col sm:flex-row gap-30">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="text-[14px] font-medium text-[#9aa3b5] mb-4">{col.title}</p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[15px] font-semibold text-[#11512a] hover:opacity-70 transition-opacity duration-300"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="md:shrink-0 mr-auto md:mr-5">
            <SubscribeForm />
          </div>
        </div>
      </div>

      <div className="border-t border-[#e0e0e0]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="text-[13px] text-[#11512a] leading-relaxed">
            <p>A recognized 501(c)(3) charitable entity in the USA / Federal ID 26-3242787.</p>
            <p>
              A registered charity in Canada / 8534 23192 RR0001 &copy;ONE DROP&trade;. All
              rights reserved. 8400, Avenue du Cirque, Montreal QC H1Z 4M6
            </p>
            <p>
              <span className="italic">A&middot;B&middot;C for Sustainability&trade;</span> and{" "}
              <span className="italic">Social Art for Behavior Change&trade;</span> are
              trademarks owned by the One Drop Foundation.
            </p>
          </div>

          <div className="flex items-center gap-8 text-[14px] font-semibold text-[#11512a] shrink-0">
            <a href="#" className="hover:opacity-70 transition-opacity duration-300">
              Credits
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity duration-300">
              Fr
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity duration-300">
              Privacy Policy
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity duration-300">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}