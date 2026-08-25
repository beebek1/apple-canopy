import React, { useEffect, useRef, useState } from "react";
import Logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

const navLinks = [
  {
    label: "The Foundation",
    href: "/project",
    active: false,
    children: [
      { label: "About Us", href: "/project/about" },
      { label: "Our Mission", href: "/project/mission" },
      { label: "Team", href: "/project/team" },
      { label: "Impact Report", href: "/project/impact" },
    ],
  },
  { label: "The Orchards", href: "/orchards" },
  { label: "Blogs", href: "/blogs" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    handleScroll(); // set correct state on mount (e.g. if page loads mid-scroll)
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openNow = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  };

  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 z-50 w-full h-[95px] z-[5000] flex items-center justify-between px-7 sm:px-6 md:px-10 lg:px-16 bg-white font-poppins border-b transition-colors duration-200 ${
          isScrolled ? "border-gray-200" : "border-transparent"
        }`}
      >
        <div className="flex items-center gap-6 md:gap-6 lg:gap-12">
          <div className="logo shrink-0 -translate-y-1">
            <Link to="/">
              <img
                src={Logo}
                alt="Logo"
                className="h-[50px] md:h-[60px] block"
              />
            </Link>
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
            {navLinks.map((link) => {
              const hasChildren = !!link.children?.length;
              const isOpen = openDropdown === link.label;

              return (
                <div
                  key={link.label}
                  className="relative w-full md:w-auto"
                  onMouseEnter={() => hasChildren && openNow(link.label)}
                  onMouseLeave={() => hasChildren && closeSoon()}
                >
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (hasChildren) {
                        e.preventDefault();
                        setOpenDropdown(isOpen ? null : link.label);
                      } else {
                        setMenuOpen(false);
                      }
                    }}
                    aria-expanded={hasChildren ? isOpen : undefined}
                    className={`
                      relative flex items-center gap-1.5 text-[14px] font-medium uppercase tracking-wider pb-1.5
                      after:content-[''] after:absolute after:left-0 after:bottom-0
                      after:h-[2px] after:bg-[#11512a] after:transition-all after:duration-300
                      hover:text-[#11512a] hover:after:w-full
                      ${link.active ? "text-[#11512a] after:w-full" : "text-[#9aa3b5] after:w-0"}
                    `}
                  >
                    {link.label}
                    {hasChildren && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        className={`transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M1.5 3.5L5 7L8.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </a>

                  {hasChildren && (
                    <div
                      className={`
                        md:absolute md:top-full md:left-0 md:mt-3 md:w-[220px]
                        md:bg-white md:rounded-lg md:shadow-[0_10px_30px_rgba(0,0,0,0.12)]
                        md:border md:border-gray-100 md:py-2
                        overflow-hidden transition-all duration-200 ease-out
                        ${
                          isOpen
                            ? "grid grid-rows-[1fr] opacity-100 mt-3 md:mt-3"
                            : "grid grid-rows-[0fr] opacity-0 md:pointer-events-none"
                        }
                      `}
                    >
                      <div className="overflow-hidden flex flex-col md:min-h-0">
                        {link.children!.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            onClick={() => {
                              setMenuOpen(false);
                              setOpenDropdown(null);
                            }}
                            className="px-4 py-2.5 text-[13px] font-medium text-[#4a5568] hover:text-[#11512a] hover:bg-[#11512a]/5 uppercase tracking-wide transition-colors duration-150"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

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

      <div className="h-[95px] w-full" />
    </>
  );
}