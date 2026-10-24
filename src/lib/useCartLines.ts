import { useEffect, useRef, useState } from "react";
import { useCart, type ClampChange } from "./cart";
import { availableFor, useProducts, useStock } from "./queries";

/** Joins the cart with fresh product + stock data and clamps quantities to available stock. */
export function useCartLines() {
  const cart = useCart();
  const products = useProducts();
  const stock = useStock(cart.items.map((i) => i.sku));
  const [notices, setNotices] = useState<ClampChange[]>([]);
  const lastStamp = useRef(0);

  useEffect(() => {
    if (!stock.data || stock.dataUpdatedAt === lastStamp.current) return;
    lastStamp.current = stock.dataUpdatedAt;
    const changes = cart.clampTo(stock.data);
    if (changes.length) setNotices((n) => [...n.filter((x) => !changes.some((c) => c.sku === x.sku)), ...changes]);
  }, [stock.data, stock.dataUpdatedAt, cart]);

  const bySku = new Map((products.data ?? []).map((p) => [p.sku, p]));
  const lines = cart.items.map((i) => {
    const product = bySku.get(i.sku);
    const available = availableFor(product, i.sku, stock.data);
    return { ...i, product, available, lineTotal: product ? Number(product.price) * i.qty : 0 };
  });
  const currency = lines.find((l) => l.product)?.product?.currency ?? "USD";
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const nameOf = (sku: string) => bySku.get(sku)?.name ?? sku;

  return { cart, products, stock, lines, currency, subtotal, notices, setNotices, nameOf };
}
