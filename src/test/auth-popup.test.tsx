import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MandatoryAuthPopup } from "@/components/MandatoryAuthPopup";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider, useCart } from "@/lib/cart";
import * as auth from "@/lib/auth";
import { ApiError } from "@/lib/api";

vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
const user = { id: 1, name: "Customer", email: "customer@example.com", phone: "9876543210" };
const savedCart = [{ sku: "existing-item", qty: 3 }];
function CartCount() { const { count } = useCart(); return <output aria-label="Cart count">{count}</output>; }
async function mount(homepage = true) {
  render(<StrictMode><AuthProvider><CartProvider><CartCount /><MandatoryAuthPopup homepage={homepage} /></CartProvider></AuthProvider></StrictMode>);
  await act(async () => {});
}
async function tick(ms: number) { await act(async () => { vi.advanceTimersByTime(ms); }); }
function signIn() {
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: user.email } });
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: "Testpass123" } });
  fireEvent.submit(screen.getByRole("button", { name: "Sign in", exact: true }).closest("form") as HTMLFormElement);
}
beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear(); sessionStorage.clear();
  localStorage.setItem("cartnova:cart", JSON.stringify(savedCart));
  vi.spyOn(auth, "getCurrentUser").mockResolvedValue(null);
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe("mandatory homepage authentication", () => {
  it("opens at exactly 2,000 milliseconds, not at 1,999", async () => {
    await mount(); await tick(1999);
    expect(screen.queryByRole("dialog")).toBeNull();
    await tick(1); expect(screen.getByRole("dialog")).toBeVisible();
  });
  it("does not open for a signed-in customer", async () => {
    vi.mocked(auth.getCurrentUser).mockResolvedValue(user);
    await mount(); await tick(2000);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("waits for a pending session check rather than showing to an authenticated customer", async () => {
    let resolve: (u: auth.AuthUser | null) => void = () => {};
    vi.mocked(auth.getCurrentUser).mockImplementation(() => new Promise((r) => { resolve = r; }));
    await mount(); await tick(2000); expect(screen.queryByRole("dialog")).toBeNull();
    await act(async () => { resolve(user); }); expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("does not start a timer outside the homepage", async () => {
    await mount(false); await tick(4000); expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("cannot be dismissed by Escape or an outside pointer", async () => {
    await mount(); await tick(2000);
    expect(screen.queryByRole("button", { name: /close|cancel/i })).toBeNull();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    fireEvent.pointerDown(document.body); fireEvent.click(document.body);
    expect(screen.getByRole("dialog")).toBeVisible();
  });
  it("switches both forms within the popup", async () => {
    await mount(); await tick(2000);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up", exact: true }));
    expect(screen.getByLabelText("Full name")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Sign In", exact: true }));
    expect(screen.queryByLabelText("Full name")).toBeNull();
    expect(screen.getByRole("dialog")).toBeVisible();
  });
  it("keeps errors visible when the real authentication request fails", async () => {
    vi.spyOn(auth, "login").mockRejectedValue(new ApiError("network", auth.AUTH_UNAVAILABLE));
    await mount(); await tick(2000); await act(async () => { signIn(); });
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent(auth.AUTH_UNAVAILABLE);
  });
  it("closes after sign-in and preserves cart without persisting authentication", async () => {
    vi.spyOn(auth, "login").mockResolvedValue(user);
    await mount(); await tick(2000); await act(async () => { signIn(); });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByLabelText("Cart count")).toHaveTextContent("3");
    expect(JSON.parse(localStorage.getItem("cartnova:cart") ?? "null")).toEqual(savedCart);
    expect(Object.keys(localStorage)).toEqual(["cartnova:cart"]);
    expect(sessionStorage.length).toBe(0);
  });
  it("closes after sign-up and preserves the existing cart", async () => {
    const register = vi.spyOn(auth, "register").mockResolvedValue(user);
    await mount(); await tick(2000);
    fireEvent.click(screen.getByRole("button", { name: "Sign Up", exact: true }));
    for (const [label, value] of [["Full name", user.name], ["Email address", user.email], ["Phone number", user.phone], ["Password", "Testpass123"], ["Confirm password", "Testpass123"]]) {
      fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
    }
    fireEvent.click(screen.getByRole("checkbox"));
    await act(async () => { fireEvent.submit(screen.getByRole("button", { name: "Create account", exact: true }).closest("form") as HTMLFormElement); });
    expect(register).toHaveBeenCalledWith({ name: user.name, email: user.email, phone: user.phone, password: "Testpass123", accepted_terms: true });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(JSON.parse(localStorage.getItem("cartnova:cart") ?? "null")).toEqual(savedCart);
    expect(Object.keys(localStorage)).toEqual(["cartnova:cart"]);
    expect(sessionStorage.length).toBe(0);
  });
});