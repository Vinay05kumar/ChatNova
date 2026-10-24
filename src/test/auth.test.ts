import { afterEach, describe, expect, it, vi } from "vitest";
import { login, normalizePhone, AUTH_UNAVAILABLE, INVALID_CREDENTIALS } from "@/lib/auth";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => vi.restoreAllMocks());

describe("auth", () => {
  it("normalizes phone with +91, spaces and hyphens to 10 digits", () => {
    expect(normalizePhone("+91 98765-43210")).toBe("9876543210");
    expect(normalizePhone("12345")).toBeNull();
  });

  it("retries a 403 login exactly once with a fresh CSRF token", async () => {
    const f = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (url) =>
        String(url).endsWith("/auth/csrf/") ? json(200, { csrf_token: "t" }) : json(403, {}),
      );
    await expect(login({ email: "a@b.co", password: "x" })).rejects.toBeTruthy();
    const posts = f.mock.calls.filter(([u]) => String(u).endsWith("/auth/login/"));
    expect(posts).toHaveLength(2);
  });

  it("shows the generic message on 401", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) =>
      String(url).endsWith("/auth/csrf/")
        ? json(200, { csrf_token: "t" })
        : json(401, { error: "invalid_credentials" }),
    );
    await expect(login({ email: "a@b.co", password: "x" })).rejects.toThrow(INVALID_CREDENTIALS);
  });

  it("reports network failure as service unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fail"));
    await expect(login({ email: "a@b.co", password: "x" })).rejects.toThrow(AUTH_UNAVAILABLE);
  });
});
