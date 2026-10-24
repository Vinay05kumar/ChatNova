import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-muted-foreground" role="status">
      <Loader2 className="h-5 w-5 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="panel mx-auto my-10 max-w-lg p-8 text-center" role="alert">
      <AlertTriangle className="mx-auto h-8 w-8 text-warning" />
      <p className="mt-3 font-semibold">{message}</p>
      {onRetry && (
        <button className="btn-secondary mt-5" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="panel mx-auto my-10 max-w-lg p-10 text-center">
      <p className="text-lg font-bold">{title}</p>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
