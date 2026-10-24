import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { StockMap } from "./api";

export interface CartItem {
  sku: string;
  qty: number;
}
export interface ClampChange {
  sku: string;
  from: number;
  to: number;
}

const KEY = "cartnova:cart";

interface CartCtx {
  items: CartItem[];
  ready: boolean;
  count: number;
  add: (sku: string, qty: number, max: number) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  clampTo: (stock: StockMap) => ClampChange[];
}
const Ctx = createContext<CartCtx | null>(null);

function read(): CartItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((i) => i && typeof i.sku === "string" && Number.isInteger(i.qty) && i.qty > 0)
      .map((i) => ({ sku: i.sku, qty: i.qty }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && setItems(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items.map(({ sku, qty }) => ({ sku, qty }))));
  }, [items, ready]);

  const add = useCallback((sku: string, qty: number, max: number) => {
    setItems((prev) => {
      const cur = prev.find((i) => i.sku === sku)?.qty ?? 0;
      const next = Math.min(cur + qty, max);
      if (next <= 0) return prev;
      return cur ? prev.map((i) => (i.sku === sku ? { sku, qty: next } : i)) : [...prev, { sku, qty: next }];
    });
  }, []);
  const setQty = useCallback(
    (sku: string, qty: number) =>
      setItems((prev) => (qty <= 0 ? prev.filter((i) => i.sku !== sku) : prev.map((i) => (i.sku === sku ? { sku, qty } : i)))),
    [],
  );
  const remove = useCallback((sku: string) => setItems((p) => p.filter((i) => i.sku !== sku)), []);
  const clear = useCallback(() => setItems([]), []);

  const clampTo = useCallback(
    (stock: StockMap) => {
      const changes: ClampChange[] = [];
      for (const i of items) {
        const avail = stock[i.sku];
        if (avail !== undefined && i.qty > avail) changes.push({ sku: i.sku, from: i.qty, to: Math.max(0, avail) });
      }
      if (changes.length)
        setItems((prev) =>
          prev
            .map((i) => {
              const avail = stock[i.sku];
              return avail !== undefined && i.qty > avail ? { ...i, qty: Math.max(0, avail) } : i;
            })
            .filter((i) => i.qty > 0),
        );
      return changes;
    },
    [items],
  );

  const value = useMemo(
    () => ({ items, ready, count: items.reduce((s, i) => s + i.qty, 0), add, setQty, remove, clear, clampTo }),
    [items, ready, add, setQty, remove, clear, clampTo],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
