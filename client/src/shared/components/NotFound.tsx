import React from "react";
import NotFoundImage from "../../assets/logo.png";

export default function NotFound() {
  return (
    <div className="relative w-full min-h-screen bg-white overflow-hidden font-poppins flex items-center">
      <div className="absolute bottom-0 left-0 w-full h-[45%] bg-[#f5f0e8]" />
      <svg
        className="absolute bottom-[38%] left-0 w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill="#f5f0e8"
      >
        <path d="M0,60 C240,120 480,0 720,40 C960,80 1200,20 1440,60 L1440,120 L0,120 Z" />
      </svg>

      <div className="relative z-10 max-w-[1300px] w-full mx-auto px-6 sm:px-10 md:px-16 flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="flex-1 flex justify-center">
          <img
            src={NotFoundImage}
            alt="Page not found"
            className="w-[280px] sm:w-[380px] md:w-[460px]"
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-[64px] sm:text-[80px] md:text-[96px] font-extrabold text-[#11512a] leading-none">
            Oops,
          </h1>

          <p className="text-[16px] sm:text-[18px] text-[#11512a]/80 mt-4 max-w-md mx-auto md:mx-0 leading-relaxed">
            The page you are trying to access cannot be found at the moment.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 justify-center md:justify-start">
            <a
              href="/"
              className="bg-[#11512a] text-white px-8 py-3 text-[14px] font-semibold rounded-full hover:bg-[#0d3f20] transition-colors duration-300"
            >
              Back To Home
            </a>
            <a
              href="/contact"
              className="text-[#11512a] px-8 py-3 text-[14px] font-semibold rounded-full border-2 border-[#11512a] hover:bg-[#11512a] hover:text-white transition-colors duration-300"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}