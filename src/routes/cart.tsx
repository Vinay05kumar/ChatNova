import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { ProductImage } from "@/components/ProductCard";
import { QtySelect } from "@/components/QtySelect";
import { StockBadge } from "@/components/StockBadge";
import { StockNotices } from "@/components/StockNotices";
import { Empty, ErrorState, Loading } from "@/components/States";
import { formatPrice } from "@/lib/api";
import { useCartLines } from "@/lib/useCartLines";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — CartNova" },
      { name: "description", content: "Review the items in your CartNova shopping cart." },
      { property: "og:title", content: "Your Cart — CartNova" },
      { property: "og:description", content: "Review the items in your CartNova shopping cart." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, products, stock, lines, currency, subtotal, notices, setNotices, nameOf } = useCartLines();

  if (!cart.ready || (cart.items.length > 0 && products.isPending)) return <Loading label="Loading your cart…" />;
  if (cart.items.length === 0)
    return (
      <div className="mx-auto max-w-7xl px-4">
        <StockNotices notices={notices} nameOf={nameOf} onDismiss={() => setNotices([])} />
        <Empty title="Your CartNova cart is empty">
          <p className="mb-4">Find something you love and add it to your cart.</p>
          <Link to="/" className="btn-primary">Continue shopping</Link>
        </Empty>
      </div>
    );
  if (products.isError) return <ErrorState message={(products.error as Error).message} onRetry={() => products.refetch()} />;

  const blocked = lines.some((l) => !l.product || l.qty > l.available);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <StockNotices notices={notices} nameOf={nameOf} onDismiss={() => setNotices([])} />
      {stock.isError && <p className="mb-4 text-sm text-warning" role="alert">We couldn't refresh live stock. Quantities will be confirmed at checkout.</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="panel p-5" aria-labelledby="cart-h">
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <h1 id="cart-h" className="text-2xl font-bold">Shopping Cart</h1>
            <span className="text-sm text-muted-foreground">Price</span>
          </div>
          <ul>
            {lines.map((l) => (
              <li key={l.sku} className="flex gap-4 border-b border-border py-4 last:border-0">
                <Link to="/product/$sku" params={{ sku: l.sku }} className="focus-ring shrink-0 rounded">
                  <ProductImage src={l.product?.image_url ?? ""} alt={l.product?.name ?? l.sku} className="h-24 w-24 object-contain sm:h-32 sm:w-32" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex justify-between gap-3">
                    <Link to="/product/$sku" params={{ sku: l.sku }} className="focus-ring line-clamp-2 rounded font-semibold hover:underline">
                      {l.product?.name ?? l.sku}
                    </Link>
                    <span className="whitespace-nowrap font-bold">{l.product ? formatPrice(l.lineTotal, l.product.currency) : "—"}</span>
                  </div>
                  {l.product ? (
                    <>
                      <span className="text-sm text-muted-foreground">{formatPrice(l.product.price, l.product.currency)} each</span>
                      <StockBadge stock={l.available} />
                    </>
                  ) : (
                    <span className="text-sm text-destructive">This product is no longer available.</span>
                  )}
                  <div className="mt-1 flex items-center gap-3">
                    {l.available > 0 && <QtySelect value={Math.min(l.qty, l.available)} max={l.available} onChange={(n) => cart.setQty(l.sku, n)} label={`Quantity for ${l.product?.name ?? l.sku}`} />}
                    <button className="focus-ring inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-muted-foreground hover:text-destructive" onClick={() => cart.remove(l.sku)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <aside className="panel h-fit space-y-4 p-5" aria-label="Cart summary">
          <p className="text-lg">
            Subtotal ({cart.count} {cart.count === 1 ? "item" : "items"}): <span className="font-bold">{formatPrice(subtotal, currency)}</span>
          </p>
          <p className="text-xs text-muted-foreground">Final total is confirmed by CartNova when you place your order.</p>
          {blocked ? (
            <p className="text-sm text-destructive">Remove unavailable items to continue.</p>
          ) : null}
          {blocked ? (
            <button className="btn-primary w-full" disabled>Proceed to Checkout</button>
          ) : (
            <Link to="/checkout" className="btn-primary w-full">Proceed to Checkout</Link>
          )}
          <Link to="/" className="btn-secondary w-full">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
