import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, type Product } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { StockBadge } from "./StockBadge";

export function ProductImage({ src, alt, className }: { src: string; alt: string; className?: string | undefined }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" className={className} />
  ) : (
    <div className={`flex items-center justify-center text-muted-foreground ${className}`}><ImageOff className="h-8 w-8" aria-label="No image" /></div>
  );
}

export function ProductCard({ product, stock }: { product: Product; stock: number }) {
  const { add, items } = useCart();
  const inCart = items.find((i) => i.sku === product.sku)?.qty ?? 0;
  const canAdd = stock > 0 && inCart < stock;
  return (
    <article className="panel flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link to="/product/$sku" params={{ sku: product.sku }} className="focus-ring block bg-card p-4">
        <ProductImage src={product.image_url} alt={product.name} className="mx-auto aspect-square w-full object-contain" />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-border p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.category}</p>
        <Link to="/product/$sku" params={{ sku: product.sku }} className="focus-ring line-clamp-2 rounded font-semibold hover:text-accent-foreground hover:underline">
          {product.name}
        </Link>
        <p className="text-xl font-bold">{formatPrice(product.price, product.currency)}</p>
        <StockBadge stock={stock} />
        <button
          className="btn-primary mt-auto w-full"
          disabled={!canAdd}
          onClick={() => {
            add(product.sku, 1, stock);
            toast.success(`Added ${product.name} to cart`);
          }}
        >
          {stock <= 0 ? "Out of stock" : inCart >= stock ? "Max in cart" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
