import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getSessionsApi, revokeSessionApi, revokeOtherSessionsApi, logoutApi } from "../auth.api";
import type { Session } from "../auth.types";
import { useNavigate } from "react-router-dom";

export default function SessionsPanel() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSessionsApi();
      setSessions(res.data.data);
    } catch {
      toast.error("Couldn't load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  async function handleRevoke(sessionId: string) {
    setRevokingId(sessionId);
    try {
      await revokeSessionApi(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session revoked");
    } catch {
      toast.error("Couldn't revoke session");
    } finally {
      setRevokingId(null);
    }
  }

  async function handleRevokeOthers() {
    try {
      await toast.promise(revokeOtherSessionsApi(), {
        loading: "Revoking other sessions...",
        success: "Other sessions revoked",
        error: "Couldn't revoke other sessions",
      });
      fetchSessions();
    } catch {
      // toast.promise already surfaced the error
    }
  }

  async function handleLogout() {
    try {
      await logoutApi();
    } finally {
      navigate("/auth", { replace: true });
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading sessions...</p>;

  return (
    <div className="w-full px-7 sm:px-6 md:px-10 lg:px-16 py-8 pb-110 font-['Poppins',_sans-serif]">
      <hr className="border-gray-200 pb-1" />
      <hr className="border-gray-200 pb-4" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Active sessions</h2>
          <p className="text-sm text-gray-500 mt-1">
            {sessions.length} device{sessions.length !== 1 ? "s" : ""} signed in
          </p>
        </div>
        <div className="flex items-center gap-4">
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeOthers}
              className="text-sm font-medium text-[#ff5a1f] hover:underline cursor-pointer"
            >
              Log out other devices
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left font-semibold text-gray-600 px-4 py-3 whitespace-nowrap">Device</th>
              <th className="text-left font-semibold text-gray-600 px-4 py-3 whitespace-nowrap">IP address</th>
              <th className="text-left font-semibold text-gray-600 px-4 py-3 whitespace-nowrap">Signed in</th>
              <th className="text-left font-semibold text-gray-600 px-4 py-3 whitespace-nowrap">Status</th>
              <th className="text-right font-semibold text-gray-600 px-4 py-3 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-gray-900 max-w-xs break-words">
                  {s.userAgent ?? "Unknown device"}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.ip ?? "Unknown"}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {s.isCurrent ? (
                    <span className="inline-block rounded-full bg-orange-50 text-[#ff5a1f] text-xs font-semibold px-2.5 py-1">
                      This device
                    </span>
                  ) : (
                    <span className="inline-block rounded-full bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {s.isCurrent ? (
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-red-600 hover:underline cursor-pointer"
                    >
                      Log out
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRevoke(s.id)}
                      disabled={revokingId === s.id}
                      className="text-sm font-medium text-gray-600 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                    >
                      {revokingId === s.id ? "Revoking..." : "Revoke"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}