import { Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";

export function AuthField({ id, label, errs, hint, children }: { id: string; label: string; errs?: string[] | undefined; hint?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
      {hint && !errs?.length ? <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      {errs?.length ? <p id={`${id}-err`} className="mt-1 text-sm text-destructive" role="alert">{errs.join(" ")}</p> : null}
    </div>
  );
}

export function PasswordInput({ id, value, onChange, autoComplete, invalid }: { id: string; value: string; onChange: (v: string) => void; autoComplete: "new-password" | "current-password"; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        className="field pr-20"
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-err` : undefined}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="focus-ring absolute inset-y-1 right-1 flex items-center gap-1 rounded px-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export function Banner({ children }: { children: ReactNode }) {
  return <div className="panel mb-4 border-destructive p-4 text-sm font-medium text-destructive" role="alert">{children}</div>;
}
