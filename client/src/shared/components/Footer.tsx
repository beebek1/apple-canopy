import React from "react";
import { RiFacebookFill as Facebook} from "react-icons/ri";
import { IoMail as Mail } from "react-icons/io5";
import { BsTwitterX as Twitter } from "react-icons/bs";
import { RiInstagramFill as Instagram } from "react-icons/ri";
import { FaYoutube as Youtube } from "react-icons/fa6";
import { FaLinkedin as Linkedin } from "react-icons/fa";

import OffsetBadge from "../../assets/logo.png";

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
    title: "News",
    links: [],
  },
  {
    title: "Corporate Information",
    links: ["Governance", "Contact", "Team"],
  },
  {
    title: "Resources",
    links: ["Careers", "Media"],
  },
];

const socialLinks = [
  { label: "Facebook", icon: Facebook, href: "#" },
  { label: "Twitter", icon: Twitter, href: "#" },
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
];

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.5 3c.3 1.9 1.6 3.4 3.5 3.8v2.7c-1.3 0-2.5-.4-3.5-1.1v6.4c0 3.2-2.6 5.7-5.8 5.7S4.9 18 4.9 14.8s2.6-5.7 5.8-5.7c.4 0 .8 0 1.1.1v2.8c-.3-.1-.7-.2-1.1-.2-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 3-1.3 3-2.9V3h2.8z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-white font-poppins">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 pt-14 pb-10">
        <div className="flex flex-col md:flex-row gap-10 md:gap-0">
          <div className="flex items-center gap-6 md:pr-10 md:border-r border-[#d8d8d8] shrink-0">
            <img src={OffsetBadge} alt="Offset Certified" className="h-[100px]" />
          </div>

          <div className="md:pl-10 flex-1">
            <h2 className="text-[26px] sm:text-[32px] md:text-[36px] text-[#11512a] font-medium mb-6">
              Don&apos;t miss a drop, subscribe to our newsletter.
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 bg-[#a9c9bc] text-[#11512a] px-6 py-3 text-[15px] font-medium rounded hover:bg-[#98bcae] transition-colors duration-300">
                Subscribe
                <Mail size={16} />
              </button>

              {socialLinks.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-2 border border-[#d8d8d8] text-[#11512a] px-5 py-3 text-[15px] font-medium rounded hover:border-[#11512a] transition-colors duration-300"
                >
                  {label}
                  <Icon size={16} />
                </a>
              ))}

              <a
                href="#"
                className="flex items-center gap-2 border border-[#d8d8d8] text-[#11512a] px-5 py-3 text-[15px] font-medium rounded hover:border-[#11512a] transition-colors duration-300"
              >
                Tiktok
                <TiktokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-full border-t border-[#e0e0e0]">
        <span className="absolute left-1/2 -translate-x-1/2 -top-[7px] w-3 h-3 bg-[#a9c9bc] rounded-full rounded-tl-none rotate-45" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-10">
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