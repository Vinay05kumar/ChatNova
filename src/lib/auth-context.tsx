import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as auth from "@/lib/auth";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/lib/auth";

type Status = "loading" | "signed_in" | "signed_out";
interface AuthCtx {
  user: AuthUser | null;
  status: Status;
  register: (p: RegisterPayload) => Promise<AuthUser>;
  login: (p: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // SSR and first client render both start as "loading" (no hydration mismatch).
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;
    auth.getCurrentUser().then((u) => {
      if (!alive) return;
      setUser(u);
      setStatus(u ? "signed_in" : "signed_out");
    });
    return () => {
      alive = false;
    };
  }, []);

  const signedIn = useCallback((u: AuthUser) => {
    setUser(u);
    setStatus("signed_in");
    return u;
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      status,
      register: async (p) => signedIn(await auth.register(p)),
      login: async (p) => signedIn(await auth.login(p)),
      logout: async () => {
        await auth.logout(); // throws on failure; state is kept
        setUser(null);
        setStatus("signed_out");
      },
    }),
    [user, status, signedIn],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
