import { environment } from "@/config/environment";

export interface Product {
  sku: string;
  name: string;
  description: string;
  category: string;
  price: string | number;
  currency: string;
  stock: number;
  image_url: string;
}
export type StockMap = Record<string, number>;

export interface OrderRequest {
  idempotency_key: string;
  customer: { name: string; email: string; phone: string };
  shipping_address?: { line1: string; city: string; state: string; postal_code: string };
  items: { sku: string; qty: number }[];
  source: Attribution;
}
export interface Attribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  landing_url: string;
  referrer: string;
  first_seen_at: string;
}
export interface OrderResponse {
  ref: string;
  status: string;
  currency: string;
  total: string | number;
  customer: { name: string; email: string };
  items: { sku: string; name: string; qty: number; unit_price: string | number; line_total: string | number }[];
  created_at: string;
}

export type ApiErrorKind = "insufficient_stock" | "validation" | "rate_limited" | "server" | "network" | "not_found" | "other";

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    message: string,
    public status?: number,
    public body?: any,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${environment.apiBaseUrl}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    });
  } catch {
    throw new ApiError("network", "We couldn't reach the store. Check your connection and try again.");
  }
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* empty body */
  }
  if (res.ok) return body as T;
  if (res.status === 409 && body?.error === "insufficient_stock")
    throw new ApiError("insufficient_stock", "Some items no longer have enough stock.", 409, body);
  if (res.status === 422) throw new ApiError("validation", "Please correct the highlighted fields.", 422, body);
  if (res.status === 429) throw new ApiError("rate_limited", "Too many requests. Please wait a moment and try again.", 429, body);
  if (res.status === 404) throw new ApiError("not_found", "Not found.", 404, body);
  if (res.status >= 500) throw new ApiError("server", "Our store is having trouble right now. Please try again shortly.", res.status, body);
  throw new ApiError("other", "Something went wrong. Please try again.", res.status, body);
}

export const api = {
  products: () => request<Product[]>("/products/"),
  product: (sku: string) => request<Product>(`/products/${encodeURIComponent(sku)}/`),
  stock: (skus: string[]) => request<StockMap>(`/stock/?skus=${skus.map(encodeURIComponent).join(",")}`),
  createOrder: (body: OrderRequest) => request<OrderResponse>("/orders/", { method: "POST", body: JSON.stringify(body) }),
};

export function formatPrice(amount: string | number, currency: string) {
  const n = Number(amount);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "USD" }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}
