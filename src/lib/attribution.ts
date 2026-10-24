import type { Attribution } from "./api";

const KEY = "cartnova:first_touch";

/** Captures first-touch attribution once; never overwrites existing data. Call from useEffect. */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEY)) return;
  const p = new URLSearchParams(window.location.search);
  const data: Attribution = {
    utm_source: p.get("utm_source") || "direct",
    utm_medium: p.get("utm_medium") || "",
    utm_campaign: p.get("utm_campaign") || "",
    landing_url: window.location.href,
    referrer: document.referrer || "",
    first_seen_at: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAttribution(): Attribution {
  captureAttribution();
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { ...d, utm_source: d.utm_source || "direct" };
  } catch {
    return { utm_source: "direct", utm_medium: "", utm_campaign: "", landing_url: location.href, referrer: "", first_seen_at: new Date().toISOString() };
  }
}
