import { AlertTriangle, X } from "lucide-react";
import type { ClampChange } from "@/lib/cart";

export function StockNotices({ notices, nameOf, onDismiss }: { notices: ClampChange[]; nameOf: (s: string) => string; onDismiss: () => void }) {
  if (!notices.length) return null;
  return (
    <div className="panel mb-4 flex gap-3 border-warning p-4" role="alert">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
      <div className="flex-1 text-sm">
        <p className="font-semibold">Stock changed for some items in your cart</p>
        <ul className="mt-1 list-disc pl-5 text-muted-foreground">
          {notices.map((n) => (
            <li key={n.sku}>
              {nameOf(n.sku)}: {n.to === 0 ? "now out of stock and removed from your cart" : `only ${n.to} available — quantity reduced from ${n.from} to ${n.to}`}
            </li>
          ))}
        </ul>
      </div>
      <button className="focus-ring h-fit rounded p-1 hover:bg-muted" onClick={onDismiss} aria-label="Dismiss stock notice">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
