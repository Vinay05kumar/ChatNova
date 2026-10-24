// Session-cookie authentication against ConnectSphere (see AGENTS.md).
// Browser-only: call these from effects/event handlers, never from loaders or SSR.
import { environment } from "@/config/environment";
import { ApiError } from "@/lib/api";

export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  phone: string;
}
export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  accepted_terms: true;
}
export interface LoginPayload {
  email: string;
  password: string;
}
interface UserResponse {
  user: AuthUser;
}
export type FieldErrors = Record<string, string[]>;

export const AUTH_UNAVAILABLE = "Authentication service is not available yet";
export const INVALID_CREDENTIALS = "Incorrect email or password.";
export const RATE_LIMITED =
  "Too many sign-in attempts. Please wait a few minutes before trying again.";
// Same wording as the server-error message in api.ts.
const SERVER_ERROR = "Our store is having trouble right now. Please try again shortly.";

let csrfToken: string | null = null;

async function raw(path: string, init: RequestInit = {}): Promise<{ res: Response; body: any }> {
  let res: Response;
  try {
    res = await fetch(`${environment.apiBaseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("network", AUTH_UNAVAILABLE);
  }
  let body: any = null;
  if (res.status !== 204) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  }
  return { res, body };
}

function toError(status: number, body: any, isLogin = false): ApiError {
  if (status === 422)
    return new ApiError("validation", "Please correct the highlighted fields.", 422, body);
  if (status === 401 && isLogin) return new ApiError("other", INVALID_CREDENTIALS, 401, body);
  if (status === 429)
    return new ApiError(
      "rate_limited",
      isLogin ? RATE_LIMITED : "Too many requests. Please wait a moment and try again.",
      429,
      body,
    );
  if (status === 404) return new ApiError("not_found", AUTH_UNAVAILABLE, 404, body);
  if (status >= 500) return new ApiError("server", SERVER_ERROR, status, body);
  return new ApiError("other", "Something went wrong. Please try again.", status, body);
}

export async function fetchCsrf(): Promise<string> {
  const { res, body } = await raw("/auth/csrf/");
  if (!res.ok) throw toError(res.status, body);
  if (typeof body?.csrf_token !== "string" || !body.csrf_token)
    throw new ApiError("other", "Something went wrong. Please try again.", res.status, body);
  csrfToken = body.csrf_token;
  return body.csrf_token;
}

/** POST with CSRF; on 403 refresh the token and retry exactly once. Rotates the token after success. */
async function authPost(path: string, payload: unknown | undefined, isLogin = false): Promise<any> {
  const bodyStr = payload === undefined ? undefined : JSON.stringify(payload);
  const send = async (token: string) =>
    raw(path, { method: "POST", body: bodyStr ?? null, headers: { "X-CSRFToken": token } });

  let { res, body } = await send(csrfToken ?? (await fetchCsrf()));
  if (res.status === 403) {
    ({ res, body } = await send(await fetchCsrf()));
  }
  if (!res.ok) throw toError(res.status, body, isLogin);
  // Server rotated the token: drop the cached one and fetch the new one.
  csrfToken = null;
  fetchCsrf().catch(() => {});
  return body;
}

function readUser(body: any): AuthUser {
  const u = body?.user;
  if (!u || typeof u !== "object" || typeof u.email !== "string")
    throw new ApiError("other", "Something went wrong. Please try again.", undefined, body);
  return u as AuthUser;
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  return readUser(await authPost("/auth/register/", payload));
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  return readUser(await authPost("/auth/login/", payload, true));
}

export async function logout(): Promise<void> {
  await authPost("/auth/logout/", undefined);
}

/** Returns the signed-in user, or null for 401/404/network failures. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { res, body } = await raw("/auth/me/");
    if (res.status === 200) return readUser(body);
    return null;
  } catch {
    return null;
  }
}

// ---------- Client-side validation helpers ----------

export function normalizeEmail(v: string) {
  return v.trim().toLowerCase();
}
export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
/** Strips spaces, hyphens and an optional +91 prefix. Returns the 10 digits or null. */
export function normalizePhone(v: string): string | null {
  let s = v.replace(/[\s-]/g, "");
  if (s.startsWith("+91")) s = s.slice(3);
  return /^\d{10}$/.test(s) ? s : null;
}
export function passwordProblems(p: string): string[] {
  const out: string[] = [];
  if (p.length < 8) out.push("Use at least 8 characters.");
  if (!/[A-Za-z]/.test(p)) out.push("Include at least one letter.");
  if (!/\d/.test(p)) out.push("Include at least one number.");
  return out;
}
export function extractErrors(err: unknown): { fields: FieldErrors; banner: string | null } {
  if (err instanceof ApiError && err.status === 422) {
    const errors: Record<string, unknown> = err.body?.errors ?? {};
    const fields: FieldErrors = {};
    let banner: string | null = null;
    for (const [k, v] of Object.entries(errors)) {
      const msgs = Array.isArray(v) ? v.map(String) : [String(v)];
      if (k === "non_field_errors") banner = msgs.join(" ");
      else fields[k] = msgs;
    }
    if (!banner && Object.keys(fields).length === 0) banner = err.message;
    return { fields, banner };
  }
  if (err instanceof ApiError) return { fields: {}, banner: err.message };
  return { fields: {}, banner: "Something went wrong. Please try again." };
}
