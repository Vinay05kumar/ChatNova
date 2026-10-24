import { environment } from "@/config/environment";
import { cn } from "@/lib/utils";

export function stockLabel(n: number) {
  if (n <= 0) return "Out of stock";
  if (n <= environment.lowStockThreshold) return `Only ${n} left`;
  return "In stock";
}

export function StockBadge({ stock, className }: { stock: number; className?: string | undefined }) {
  const tone = stock <= 0 ? "text-destructive" : stock <= environment.lowStockThreshold ? "text-warning" : "text-success";
  return (
    <span className={cn("text-sm font-semibold", tone, className)} role="status">
      {stockLabel(stock)}
    </span>
  );
}
