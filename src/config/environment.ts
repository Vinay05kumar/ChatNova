// Environment-driven configuration. Override via VITE_* variables (see .env.example).
const env = import.meta.env;
const num = (v: unknown, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

export const environment = {
  apiBaseUrl: ((env["VITE_API_BASE_URL"] as string) || "https://localhost:8002/api/storefront").replace(/\/+$/, ""),
  stockPollIntervalMs: num(env["VITE_STOCK_POLL_INTERVAL_MS"], 8000),
  productsRefreshIntervalMs: num(env["VITE_PRODUCTS_REFRESH_INTERVAL_MS"], 60000),
  lowStockThreshold: num(env["VITE_LOW_STOCK_THRESHOLD"], 5),
};
