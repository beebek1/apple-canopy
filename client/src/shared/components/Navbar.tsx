import React, { useState } from "react";
import Logo from "../../assets/logo.png";

const navLinks = [
  { label: "The Project", href: "#", active: false },
  { label: "The Orchards", href: "#" },
  { label: "Transparency", href: "#" },
  { label: "Blogs", href: "#" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 z-50 w-full h-[95px] flex items-center justify-between px-7 sm:px-6 md:px-10 lg:px-16 bg-white font-poppins">
        <div className="flex items-center gap-6 md:gap-6 lg:gap-12">
          <div className="logo shrink-0 -translate-y-1">
            <img src={Logo} alt="Logo" className="h-[50px] md:h-[60px] block" />
          </div>

          <div
            className={`
              fixed top-0 right-0 h-screen w-[260px] bg-white flex flex-col items-start
              justify-center gap-8 p-10 shadow-[-4px_0_20px_rgba(0,0,0,0.08)] z-40
              transition-transform duration-300 ease-in-out
              ${menuOpen ? "translate-x-0" : "translate-x-full"}
              md:static md:h-auto md:w-auto md:flex-row md:items-center md:gap-6 lg:gap-10
              md:p-0 md:shadow-none md:translate-x-0 md:z-auto md:bg-transparent
            `}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`
                  relative text-[14px] font-medium uppercase tracking-wider pb-1.5
                  after:content-[''] after:absolute after:left-0 after:bottom-0
                  after:h-[2px] after:bg-[#11512a] after:transition-all after:duration-300
                  hover:text-[#11512a] hover:after:w-full
                  ${link.active ? "text-[#11512a] after:w-full" : "text-[#9aa3b5] after:w-0"}
                `}
              >
                {link.label}
              </a>
            ))}

            <button className="bg-[#11512a] text-white px-7 py-3 text-[14px] font-medium uppercase tracking-wider rounded hover:bg-[#0d3f20] transition-colors duration-300 mt-3 md:hidden">
              Donate
            </button>
          </div>
        </div>

        <button className="hidden md:inline-block cursor-pointer bg-[#11512a] text-white px-7 py-3 text-[14px] font-medium uppercase tracking-wider rounded hover:bg-[#0d3f20] transition-colors duration-300 shrink-0">
          Donate
        </button>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="relative z-50 flex flex-col justify-center items-center gap-1.5 w-10 h-10 bg-transparent border-none cursor-pointer md:hidden"
        >
          <span
            className={`block w-[26px] h-[2px] bg-[#11512a] rounded-full transition-transform duration-300 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          ></span>
          <span
            className={`block w-[26px] h-[2px] bg-[#11512a] rounded-full transition-opacity duration-300 ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-[26px] h-[2px] bg-[#11512a] rounded-full transition-transform duration-300 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          ></span>
        </button>
      </nav>

      <div className="h-[88px] w-full" />
    </>
  );
}