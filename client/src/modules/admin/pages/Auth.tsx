import { useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginApi, forgotPasswordApi } from "../auth.api";
import type { LoginRequest } from "../auth.types";

interface AuthProps {
  path?: string;
  // TODO: wire this to your real auth call.
  onSubmit?: (data: { username: string; password: string }) => Promise<void> | void;
}

interface BackgroundLocationState {
  backgroundLocation?: {
    pathname: string;
    search?: string;
    hash?: string;
  };
}

export default function Auth({ path = "/auth", onSubmit }: AuthProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const open = location.pathname === path;

  const [data, setData] = useState<LoginRequest>({ username: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleChange(field: keyof LoginRequest) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function handleClose() {
    const backgroundLocation = (location.state as BackgroundLocationState | null)?.backgroundLocation;

    if (backgroundLocation) {
      // Go back to exactly the page that was open before /auth.
      // `replace: true` so /auth doesn't linger in history.
      navigate(
        {
          pathname: backgroundLocation.pathname,
          search: backgroundLocation.search,
          hash: backgroundLocation.hash,
        },
        { replace: true }
      );
    } else if (window.history.length > 1) {
      // No stashed background (e.g. direct link/refresh on /auth) — just go back.
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  }

  async function handleForgotPassword() {
    await toast.promise(forgotPasswordApi(), {
      loading: "Securing...",
      success: (res) => res.data?.message ?? "Kindly verify yourself through the email sent",
      error: (res) => res.response.data?.message || "Email couldn't be sent"
      // loading: "Your credentials will be in your inbox soon",
      // success: (res) => res.data?.message ?? "Your credentials are in your inbox. Kindly check your email",
      // error: (res) => res.response.data?.message || "Credentials can't be sent"
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.username.trim() || !data.password) {
      setError("Enter your username and password.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload: LoginRequest = { username: data.username.trim(), password: data.password };

      const response = await toast.promise(loginApi(payload), {
        loading: "Checking credentials...",
        success: (res) => res.data?.message ?? "Login successful",
        error: (err) => err?.response?.data?.message || "Login failed",
      });

      handleClose(); // close (i.e. return to previous route) on success
    } catch {
      // toast.promise already surfaced the error toast; swallow here
      // so submitting still resets in `finally` without an unhandled rejection.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // Overlay — dims and centers. z-[6000] keeps it above a fixed navbar
    // (adjust to match whatever the highest z-index in your app is).
    <div
      className="fixed inset-0 bg-black/50 z-[6000] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl shadow-2xl font-['Poppins',_sans-serif] bg-white"
      >
        {/* Sign-in form — kept intentionally minimal, this is an internal admin login */}
        <div className="relative px-8 py-10">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#ff5a1f]" />
            <span className="text-xl font-bold tracking-tight text-gray-900">Jodn</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-7">
            Enter your username and password to continue.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={data.username}
                onChange={handleChange("username")}
                placeholder="yourname"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-[#ff5a1f] hover:text-[#e04f1a] hover:underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={data.password}
                onChange={handleChange("password")}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-colors"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#14181f] text-white font-semibold text-[15px] py-2.5 rounded-lg hover:bg-[#0d1015] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}