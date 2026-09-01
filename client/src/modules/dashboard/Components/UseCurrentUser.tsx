import { useEffect, useState } from "react";
import { getCurrentUserApi } from "../../admin/auth.api"; // adjust path

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | string;
}

interface UseCurrentUserResult {
  user: CurrentUser | null;
  isAdmin: boolean;
  loading: boolean;
}

// A successful response only proves "this is a logged-in person" — it says
// nothing about whether they're an admin. The role has to come from inside
// the response body, not from the request merely succeeding.
export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCurrentUserApi();
        if (!cancelled) setUser(res.data.data);
      } catch {
        // 401 just means "not logged in" — not an error state to surface.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, isAdmin: user?.role === "ADMIN", loading };
}