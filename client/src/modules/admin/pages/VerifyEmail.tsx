import { useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPasswordApi } from "../auth.api";
import logo from "../../../assets/logo.png"
import { useSearchParams } from "react-router-dom";

interface VerifyEmailProps {
  path?: string;
}

interface BackgroundLocationState {
  backgroundLocation?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
}

export default function VerifyEmail({ path = "/verify-email" }: VerifyEmailProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const open = location.pathname === path;

  const [submitting, setSubmitting] = useState(false);

  function handleClose() {
    const backgroundLocation = (location.state as BackgroundLocationState | null)?.backgroundLocation;

    navigate(
      backgroundLocation
        ? { pathname: backgroundLocation.pathname, search: backgroundLocation.search, hash: backgroundLocation.hash }
        : "/",
      { replace: true }
    );
  }

  async function handleVerify() {

    setSubmitting(true);
    //extracting the token from the url
    const token = searchParams.get("token");
    if(!token){
      toast.error("Its bug free. Don’t waste time testing your luck.")
      return handleClose();
    }

    try {
      await toast.promise(resetPasswordApi(token!), {
        loading: "Verifying your email...",
        success: (res) => res.data?.message ?? "Email verified successfully",
        error: (err) => err?.response?.data?.message || "Verification failed",
      });

      handleClose();
    } catch {
      // toast.promise already surfaced the error toast; swallow here
      // so submitting still resets in `finally` without an unhandled rejection.
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[6000] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl shadow-2xl bg-white font-['Poppins',_sans-serif]"
      >
        <div className="relative px-8 py-10 text-center">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <img
            src={logo}
            alt="Apple Canopy"
            className="h-15 w-auto mx-auto mb-6"
          />

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#11512a]/10">
            <svg
              className="h-6 w-6 text-[#11512a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify your email</h1>
          <p className="text-sm text-gray-500 mb-8">
            Confirm your email address to finish setting up your account.
          </p>

          <button
            type="button"
            onClick={handleVerify}
            disabled={submitting}
            className="w-full bg-[#680505] text-white font-semibold text-[15px] py-2.5 rounded-lg hover:bg-[#500404] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submitting ? "Verifying…" : "Verify Email"}
          </button>
        </div>
      </div>
    </div>
  );
}