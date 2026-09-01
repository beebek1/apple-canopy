import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getDonationsApi } from "../donation.api";
import type { Donation } from "../donation.types";

function formatAmount(amountInCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

export default function DonationsPanel() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const donations = await getDonationsApi();
      setDonations(donations);
    } catch {
      toast.error("Couldn't load donations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  if (loading) return <p className="text-sm text-gray-500">Loading donations...</p>;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Donations</h2>
          <p className="text-sm text-gray-500 mt-1">
            {donations.length} completed donation{donations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left font-semibold text-gray-600 px-4 py-3 whitespace-nowrap">Donor</th>
              <th className="text-left font-semibold text-gray-600 px-4 py-3 whitespace-nowrap">Email</th>
              <th className="text-left font-semibold text-gray-600 px-4 py-3 whitespace-nowrap">Amount</th>
              <th className="text-left font-semibold text-gray-600 px-4 py-3 whitespace-nowrap">Note</th>
              <th className="text-left font-semibold text-gray-600 px-4 py-3 whitespace-nowrap">Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No donations yet
                </td>
              </tr>
            ) : (
              donations.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-gray-900 max-w-xs break-words">{d.donorName}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{d.donorEmail ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium whitespace-nowrap">
                    {formatAmount(d.amount, d.currency)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] break-words">{d.note ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(d.paidAt ?? d.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}