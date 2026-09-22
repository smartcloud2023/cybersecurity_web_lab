"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  fetchCurrentUser,
  getServerTokenSnapshot,
  getTokenSnapshot,
  recheckToken,
  subscribeToken,
  type User,
} from "@/lib/auth";

// Returns null once it's certain there's no token, undefined while that's
// still unknown (the first client render, matching the server-rendered
// HTML — see getServerTokenSnapshot). Most callers only care whether a
// token exists and can treat both falsy values the same; useCurrentUser
// below is the one place the distinction matters.
export function useAuthToken(): string | null | undefined {
  const token = useSyncExternalStore(subscribeToken, getTokenSnapshot, getServerTokenSnapshot);
  useEffect(() => {
    recheckToken();
  }, []);
  return token;
}

type FetchResult =
  | { token: string; user: User }
  | { token: string; error: true };

// Fetches /api/me whenever the token changes. The "no token"/"unresolved
// token"/"result is for a stale token" cases are derived during render
// rather than set from the effect — they're fully computable from `token`
// and `fetched`, so there's nothing to synchronize there; only the async
// fetch result needs an effect.
export function useCurrentUser(): {
  user: User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  // Profile/MFA mutations already return the fresh User in their response —
  // this writes it straight into the cache instead of forcing a wasted
  // refetch, so every consumer (topbar, other profile sections) sees the
  // update immediately.
  setUser: (user: User) => void;
} {
  const token = useAuthToken();
  const [fetched, setFetched] = useState<FetchResult | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchCurrentUser(token)
      .then((user) => {
        if (!cancelled) setFetched({ token, user });
      })
      .catch(() => {
        if (!cancelled) setFetched({ token, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  function setUser(user: User) {
    if (token) setFetched({ token, user });
  }

  if (token === undefined) {
    // Not yet checked on the client — not the same as "no token found".
    // Treating this as unauthenticated would redirect away before the real
    // client-side localStorage read even runs.
    return { user: null, status: "loading", setUser };
  }
  if (token === null) {
    return { user: null, status: "unauthenticated", setUser };
  }
  if (fetched && fetched.token === token) {
    return "user" in fetched
      ? { user: fetched.user, status: "authenticated", setUser }
      : { user: null, status: "unauthenticated", setUser };
  }
  return { user: null, status: "loading", setUser };
}
