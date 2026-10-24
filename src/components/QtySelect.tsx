import { Minus, Plus } from "lucide-react";

export function QtySelect({ value, max, onChange, label = "Quantity" }: { value: number; max: number; onChange: (n: number) => void; label?: string }) {
  const clamp = (n: number) => Math.max(1, Math.min(max, n));
  return (
    <div className="inline-flex items-center rounded-full border border-input bg-card" role="group" aria-label={label}>
      <button type="button" className="focus-ring rounded-l-full p-2 hover:bg-muted disabled:opacity-40" onClick={() => onChange(clamp(value - 1))} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        className="w-12 bg-transparent text-center text-sm font-semibold focus-visible:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        value={value}
        min={1}
        max={max}
        aria-label={label}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
      />
      <button type="button" className="focus-ring rounded-r-full p-2 hover:bg-muted disabled:opacity-40" onClick={() => onChange(clamp(value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
