import { Link } from "react-router-dom";

export default function DonateCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d3f20] to-[#11512a] flex items-center justify-center px-6 py-20 font-poppins">
      <div className="w-full max-w-[480px] text-center">
        <h1
          className="text-[36px] sm:text-[42px] leading-[1.15] text-[#F5F1E6]"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Your donation was canceled.
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-[#B9C7B4]">
          No charge was made. If this was a mistake, you can try again whenever
          you're ready — the trees will be here.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-[#F5F1E6] text-[#11512a] px-7 py-3 text-[14px] font-medium uppercase tracking-wider rounded hover:bg-white transition-colors duration-300"
          >
            Back to home
          </Link>
          <Link
            to="/project/impact"
            className="border border-[#F5F1E6]/30 text-[#F5F1E6] px-7 py-3 text-[14px] font-medium uppercase tracking-wider rounded hover:border-[#F5F1E6]/60 transition-colors duration-300"
          >
            See our impact
          </Link>
        </div>
      </div>
    </div>
  );
}