import { useQuery } from "@tanstack/react-query";
import { environment } from "@/config/environment";
import { api, type Product, type StockMap } from "./api";

const visibleInterval = (ms: number) => () =>
  typeof document !== "undefined" && document.visibilityState === "visible" ? ms : false;

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: api.products,
    refetchInterval: visibleInterval(environment.productsRefreshIntervalMs),
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

export function useProduct(sku: string) {
  return useQuery({ queryKey: ["product", sku], queryFn: () => api.product(sku), retry: 1 });
}

/** Live stock for given SKUs: polls while tab visible, refetches on focus and on mount. */
export function useStock(skus: string[]) {
  const sorted = [...new Set(skus)].sort();
  return useQuery({
    queryKey: ["stock", sorted],
    queryFn: () => api.stock(sorted),
    enabled: sorted.length > 0,
    refetchInterval: visibleInterval(environment.stockPollIntervalMs),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: "always",
    refetchOnMount: "always",
    staleTime: 0,
  });
}

export function availableFor(p: Product | undefined, sku: string, stock?: StockMap) {
  if (stock && stock[sku] !== undefined) return stock[sku];
  return p?.stock ?? 0;
}
