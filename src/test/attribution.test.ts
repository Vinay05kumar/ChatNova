import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { captureAttribution } from "@/lib/attribution";

const key = "cartnova:first_touch";
const saved = () => JSON.parse(localStorage.getItem(key) ?? "null");

beforeEach(() => localStorage.clear());
afterEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("attribution replacement", () => {
  it("replaces instagram with telegram and preserves telegram without utm_source", () => {
    window.history.replaceState({}, "", "/?utm_source=instagram&utm_campaign=first");
    captureAttribution();
    expect(saved().utm_source).toBe("instagram");
    expect(saved().utm_campaign).toBe("first");
    window.history.replaceState({}, "", "/?utm_source=telegram&utm_medium=social");
    captureAttribution();
    expect(saved().utm_source).toBe("telegram");
    expect(saved().utm_medium).toBe("social");
    expect(saved().utm_campaign).toBe("");
    const telegram = localStorage.getItem(key);
    window.history.replaceState({}, "", "/?utm_campaign=ignored");
    captureAttribution();
    expect(localStorage.getItem(key)).toBe(telegram);
  });
  it("captures direct attribution on the first visit without utm_source", () => {
    window.history.replaceState({}, "", "/");
    captureAttribution();
    expect(saved().utm_source).toBe("direct");
    expect(saved().landing_url).toBe(window.location.href);
  });
});