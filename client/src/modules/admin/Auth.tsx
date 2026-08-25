import { useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface SignInModalProps {
  // The route that should trigger this modal. Defaults to "/auth".
  path?: string;
  // TODO: wire this to your real auth call.
  onSubmit?: (username: string, password: string) => Promise<void> | void;
}

export default function SignInModal({ path = "/cms", onSubmit }: SignInModalProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // The modal is "open" purely based on the current URL now — no prop needed.
  const open = location.pathname === path;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleClose() {
    // If we got here from elsewhere in the app (there's history to go back
    // to), just go back — this preserves whatever page was open underneath.
    // Otherwise (e.g. someone linked straight to /auth), fall back to "/".
    if (window.history.length > 1) navigate(-1);
    else navigate("/", { replace: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (onSubmit) await onSubmit(username.trim(), password);
      else await new Promise((r) => setTimeout(r, 600)); // TODO: real API call
      handleClose(); // close (i.e. navigate away from /auth) on success
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
        className="w-full max-w-[820px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl font-['Poppins',_sans-serif] flex flex-col md:flex-row bg-white"
      >
        {/* Left — brand panel */}
        <div className="relative shrink-0 md:w-[46%] bg-[#14181f] text-white px-8 py-10 sm:px-10 sm:py-12 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff5a1f]" />
            <span className="text-xl font-bold tracking-tight">Jodn</span>
          </div>

          <div className="mt-10 md:mt-16">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#ff5a1f] mb-3">
              Welcome
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold leading-[1.15] tracking-tight mb-8">
              Nepal's creator
              <br />
              marketplace.
            </h2>

            <ul className="space-y-3">
              {[
                "Direct connections — no middlemen",
                "Verified creators and brands",
                "Free for creators, always",
                "Built for authentic collaborations",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-gray-300">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="mt-0.5 shrink-0 text-[#ff5a1f]"
                  >
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M6 10.5l2.5 2.5L14 7.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:block" />
        </div>

        {/* Right — sign-in form */}
        <div className="relative flex-1 px-8 py-10 sm:px-10 sm:py-12">
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="/forgot-password" className="text-xs font-medium text-[#ff5a1f] hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <p className="text-xs text-gray-400 text-center mt-6">
            Don't have an account?{" "}
            <a href="/signup" className="font-medium text-gray-600 hover:text-[#ff5a1f] transition-colors">
              Create one
            </a>
          </p>

          <p className="text-xs text-gray-400 text-center mt-4">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline hover:text-gray-600">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-gray-600">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}