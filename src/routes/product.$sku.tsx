import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProductImage } from "@/components/ProductCard";
import { QtySelect } from "@/components/QtySelect";
import { StockBadge } from "@/components/StockBadge";
import { Empty, ErrorState, Loading } from "@/components/States";
import { formatPrice } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { availableFor, useProduct, useStock } from "@/lib/queries";

export const Route = createFileRoute("/product/$sku")({
  head: ({ params }) => ({
    meta: [
      { title: `Product ${params.sku} — CartNova` },
      { name: "description", content: "Product details, price and live stock on CartNova." },
      { property: "og:title", content: `Product ${params.sku} — CartNova` },
      { property: "og:description", content: "Product details, price and live stock on CartNova." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { sku } = Route.useParams();
  const product = useProduct(sku);
  const stockQ = useStock([sku]);
  const { add, items } = useCart();
  const [qty, setQty] = useState(1);

  if (product.isPending) return <Loading label="Loading product…" />;
  if (product.isError) {
    const nf = (product.error as any)?.kind === "not_found";
    return nf ? (
      <Empty title="Product not found"><Link to="/" className="btn-secondary">Continue shopping</Link></Empty>
    ) : (
      <ErrorState message={(product.error as Error).message} onRetry={() => product.refetch()} />
    );
  }
  const p = product.data;
  const stock = availableFor(p, sku, stockQ.data);
  const inCart = items.find((i) => i.sku === sku)?.qty ?? 0;
  const remaining = Math.max(0, stock - inCart);
  const q = Math.min(qty, Math.max(1, remaining));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Link to="/" className="focus-ring mb-4 inline-flex items-center gap-1 rounded text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to results
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr_320px]">
        <div className="panel p-6">
          <ProductImage src={p.image_url} alt={p.name} className="mx-auto aspect-square w-full max-w-lg object-contain" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">{p.category}</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight md:text-3xl">{p.name}</h1>
          <p className="mt-1 text-xs text-muted-foreground">SKU: {p.sku}</p>
          <hr className="my-4 border-border" />
          <p className="text-3xl font-bold">{formatPrice(p.price, p.currency)}</p>
          <h2 className="mt-6 font-bold">About this item</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{p.description || "No description provided."}</p>
        </div>
        <aside className="panel h-fit space-y-4 p-5" aria-label="Purchase options">
          <p className="text-2xl font-bold">{formatPrice(p.price, p.currency)}</p>
          <StockBadge stock={stock} className="block text-base" />
          {inCart > 0 && <p className="text-sm text-muted-foreground">{inCart} already in your cart</p>}
          {remaining > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Qty</span>
              <QtySelect value={q} max={remaining} onChange={setQty} />
            </div>
          )}
          <button
            className="btn-primary w-full"
            disabled={remaining <= 0}
            onClick={() => {
              add(sku, q, stock);
              toast.success(`Added ${q} × ${p.name} to cart`);
              setQty(1);
            }}
          >
            {stock <= 0 ? "Out of stock" : remaining <= 0 ? "Maximum in cart" : "Add to Cart"}
          </button>
          <Link to="/cart" className="btn-secondary w-full">Go to cart</Link>
        </aside>
      </div>
    </div>
  );
}
