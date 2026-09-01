import { useState } from "react";
import { createCheckoutSessionApi } from "../donation.api";

const PRESETS = [1000, 2500, 5000, 10000]; // cents
const MAX_AMOUNT_CENTS = 99_999_999;
const MIN_AMOUNT_CENTS = 50;
const MAX_NOTE_LENGTH = 50;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface DonateModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormErrors {
  donorName?: string;
  amount?: string;
  donorEmail?: string;
  note?: string;
  form?: string;
}

export default function DonateModal({ open, onClose }: DonateModalProps) {
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState<number>(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  if (!open) return null;

  const getAmountCents = () =>
    customAmount ? Math.round(parseFloat(customAmount) * 100) : amount;

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    const trimmedName = donorName.trim();
    const amountCents = getAmountCents();

    if (!trimmedName) {
      next.donorName = "Enter your name";
    } else if (trimmedName.length > 255) {
      next.donorName = "Name is too long";
    }

    if (!Number.isFinite(amountCents) || Number.isNaN(amountCents)) {
      next.amount = "Enter a valid amount";
    } else if (!Number.isInteger(amountCents)) {
      next.amount = "Enter an amount to the nearest cent";
    } else if (amountCents < MIN_AMOUNT_CENTS) {
      next.amount = "Minimum donation is $0.50";
    } else if (amountCents > MAX_AMOUNT_CENTS) {
      next.amount = "Amount exceeds the maximum allowed donation";
    }

    if (donorEmail.trim() && !EMAIL_RE.test(donorEmail.trim())) {
      next.donorEmail = "Enter a valid email address";
    }

    if (note.length > MAX_NOTE_LENGTH) {
      next.note = `Note must be ${MAX_NOTE_LENGTH} characters or less`;
    }

    return next;
  };

  const handleDonate = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const url = await createCheckoutSessionApi({
        donorName: donorName.trim(),
        amount: getAmountCents(),
        currency: "usd",
        ...(donorEmail.trim() ? { donorEmail: donorEmail.trim() } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      window.location.href = url;
    } catch (err: any) {
      console.error(err);
      setErrors({
        form: err.response?.data?.message ?? "Something went wrong. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#11512a]/10 text-[#11512a]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21s-7.5-4.7-10-9.1C.4 8.4 2 5 5.5 5c2 0 3.5 1.2 4.5 2.7C11 6.2 12.5 5 14.5 5 18 5 19.6 8.4 22 11.9 19.5 16.3 12 21 12 21z" />
              </svg>
            </span>
            <div>
              <h2 id="donate-modal-title" className="text-lg font-semibold text-gray-900">
                Make a donation
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Every contribution helps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-7 py-6 space-y-5">
          {/* Donor name */}
          <div>
            <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Name
            </label>
            <input
              id="donorName"
              type="text"
              value={donorName}
              onChange={(e) => {
                setDonorName(e.target.value);
                setErrors((prev) => ({ ...prev, donorName: undefined }));
              }}
              placeholder="Your full name"
              maxLength={255}
              className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11512a]/20 focus:border-[#11512a] transition-shadow ${
                errors.donorName ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.donorName && (
              <p className="text-red-600 text-xs mt-1">{errors.donorName}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PRESETS.map((preset) => {
                const selected = amount === preset && !customAmount;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount("");
                      setErrors((prev) => ({ ...prev, amount: undefined }));
                    }}
                    className={`py-2.5 rounded-md border text-sm font-medium transition-colors ${
                      selected
                        ? "bg-[#11512a] text-white border-[#11512a]"
                        : "border-gray-200 text-gray-700 hover:border-[#11512a]/50 hover:bg-[#11512a]/[0.03]"
                    }`}
                  >
                    ${(preset / 100).toFixed(0)}
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                min="0.5"
                step="0.5"
                className={`w-full border rounded-md pl-7 pr-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11512a]/20 focus:border-[#11512a] transition-shadow ${
                  errors.amount ? "border-red-400" : "border-gray-200"
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-red-600 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="donorEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-gray-400 font-normal">(optional, for your receipt)</span>
            </label>
            <input
              id="donorEmail"
              type="email"
              value={donorEmail}
              onChange={(e) => {
                setDonorEmail(e.target.value);
                setErrors((prev) => ({ ...prev, donorEmail: undefined }));
              }}
              placeholder="you@example.com"
              className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11512a]/20 focus:border-[#11512a] transition-shadow ${
                errors.donorEmail ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.donorEmail && (
              <p className="text-red-600 text-xs mt-1">{errors.donorEmail}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <span className="text-xs text-gray-400">
                {note.length}/{MAX_NOTE_LENGTH}
              </span>
            </div>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => {
                setNote(e.target.value.slice(0, MAX_NOTE_LENGTH));
                setErrors((prev) => ({ ...prev, note: undefined }));
              }}
              placeholder="Say a few words"
              maxLength={MAX_NOTE_LENGTH}
              className={`w-full border rounded-md px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11512a]/20 focus:border-[#11512a] transition-shadow ${
                errors.note ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.note && (
              <p className="text-red-600 text-xs mt-1">{errors.note}</p>
            )}
          </div>

          {errors.form && (
            <p className="text-red-600 text-sm" role="alert">
              {errors.form}
            </p>
          )}

          <button
            onClick={handleDonate}
            disabled={loading}
            className="w-full bg-[#11512a] text-white py-3 rounded-md font-medium text-sm hover:bg-[#0d3f20] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Redirecting…
              </span>
            ) : (
              "Donate now"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}