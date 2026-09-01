import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getSessionApi } from "../donation.api";
import type { Donation } from "../donation.types";

const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 6; // ~15s before we stop polling and just say "check your email"

export default function DonateSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  const [donation, setDonation] = useState<Donation | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Guard #1: no token at all -> don't render this page.
  useEffect(() => {
    if (!sessionId) {
      navigate("/", { replace: true });
    }
  }, [sessionId, navigate]);

  // Fetch + light polling in case the webhook hasn't landed yet.
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        const data = await getSessionApi(sessionId);
        if (cancelled) return;

        setDonation(data);

        if (data.status === "PENDING" && attempts < MAX_POLLS) {
          attempts += 1;
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        // Guard #2: token doesn't resolve to a real donation -> bounce.
        if (!cancelled) setNotFound(true);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (notFound) {
      const t = setTimeout(() => navigate("/", { replace: true }), 2000);
      return () => clearTimeout(t);
    }
  }, [notFound, navigate]);

  if (!sessionId || notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d3f20] to-[#11512a] flex items-center justify-center px-6 py-20 font-poppins">
        <p className="text-[#F5F1E6] text-[15px]">
          {notFound
            ? "We couldn't find a donation for this link. Redirecting you home…"
            : null}
        </p>
      </div>
    );
  }

  const isCompleted = donation?.status === "COMPLETED";
  const isPending = !donation || donation.status === "PENDING";
  const firstName = donation?.donorName?.trim().split(" ")[0];

  const formattedAmount = donation
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: donation.currency.toUpperCase(),
      }).format(donation.amount / 100)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d3f20] to-[#11512a] flex items-center justify-center px-6 py-20 font-poppins">
      <div className="w-full max-w-[480px] text-center">
        <Sprout />

        <h1
          className="mt-8 text-[36px] sm:text-[42px] leading-[1.15] text-[#F5F1E6]"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          {isCompleted && firstName ? `Thank you, ${firstName}.` : "Your gift just took root."}
        </h1>

        <p className="mt-4 text-[15px] leading-relaxed text-[#B9C7B4]">
          {isCompleted
            ? "Your donation is confirmed. What you've given will grow into new trees, tended soil, and orchards for people who haven't arrived yet."
            : "We're confirming your donation with Stripe — this usually takes a few seconds."}
        </p>

        {isCompleted && formattedAmount && (
          <div className="mt-8 border-t border-b border-[#F5F1E6]/15 py-4">
            <p className="text-[13px] text-[#B9C7B4] mb-1">Donation amount</p>
            <p
              className="text-[28px] text-[#F5F1E6]"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
            >
              {formattedAmount}
            </p>
            {donation?.note && (
              <p className="mt-3 text-[13px] text-[#B9C7B4] italic">"{donation.note}"</p>
            )}
          </div>
        )}

        {isPending && (
          <div className="mt-8 h-[68px] flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F5F1E6]/60 animate-pulse" />
            <p className="text-[13px] text-[#B9C7B4]">Confirming your donation…</p>
          </div>
        )}

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

        {isCompleted && donation?.donorEmail && (
          <p className="mt-8 text-[12px] text-[#B9C7B4]/70">
            A receipt has been sent to {donation.donorEmail}.
          </p>
        )}
      </div>
    </div>
  );
}

function Sprout() {
  return (
    <svg
      width="72"
      height="88"
      viewBox="0 0 72 88"
      fill="none"
      className="mx-auto sprout-draw"
      aria-hidden="true"
    >
      <path d="M36 86V40" stroke="#D9A441" strokeWidth="2.5" strokeLinecap="round" className="sprout-stem" />
      <path
        d="M36 46C36 46 22 44 18 30C18 30 34 26 36 46Z"
        stroke="#D9A441"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="sprout-leaf-left"
      />
      <path
        d="M36 38C36 38 50 36 54 22C54 22 38 18 36 38Z"
        stroke="#D9A441"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="sprout-leaf-right"
      />
      <style>{`
        .sprout-stem, .sprout-leaf-left, .sprout-leaf-right {
          stroke-dasharray: 140;
          stroke-dashoffset: 140;
          animation: draw 1.1s ease-out forwards;
        }
        .sprout-leaf-left { animation-delay: 0.5s; }
        .sprout-leaf-right { animation-delay: 0.75s; }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .sprout-stem, .sprout-leaf-left, .sprout-leaf-right {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </svg>
  );
}