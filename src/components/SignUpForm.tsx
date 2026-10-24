import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthField, Banner, PasswordInput } from "@/components/AuthFields";
import {
  extractErrors,
  isValidEmail,
  normalizeEmail,
  normalizePhone,
  passwordProblems,
  type FieldErrors,
} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function SignUpForm({ onSuccess, onSwitch, embedded = false }: { onSuccess: () => void; onSwitch?: () => void; embedded?: boolean }) {
  const { register } = useAuth();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const errs: FieldErrors = {};
    const name = f.name.trim();
    const email = normalizeEmail(f.email);
    const phone = normalizePhone(f.phone);
    if (!name) errs["name"] = ["Enter your full name."];
    if (!email) errs["email"] = ["Enter your email address."];
    else if (!isValidEmail(email)) errs["email"] = ["Enter a valid email address."];
    if (!f.phone.trim()) errs["phone"] = ["Enter your phone number."];
    else if (!phone)
      errs["phone"] = ["Enter a 10-digit phone number (optionally starting with +91)."];
    const pw = passwordProblems(f.password);
    if (pw.length) errs["password"] = pw;
    if (!f.confirm) errs["confirm_password"] = ["Confirm your password."];
    else if (f.confirm !== f.password) errs["confirm_password"] = ["Passwords do not match."];
    if (!terms) errs["accepted_terms"] = ["You must accept the Terms and Conditions."];
    setErrors(errs);
    setBanner(null);
    if (Object.keys(errs).length || !phone) return;

    setBusy(true);
    try {
      await register({ name, email, phone, password: f.password, accepted_terms: true });
      toast.success("Your account has been created.");
      onSuccess();
    } catch (err) {
      const { fields, banner } = extractErrors(err);
      setErrors(fields);
      setBanner(banner);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={embedded ? "" : "mx-auto max-w-md px-4 py-10"}>
      <div className={embedded ? "" : "panel p-6 sm:p-8"}>
        {!embedded && <h1 className="mb-1 text-2xl font-bold">Create account</h1>}
        <p className="mb-5 text-sm text-muted-foreground">All fields are required.</p>
        {banner && <Banner>{banner}</Banner>}
        <form onSubmit={submit} noValidate className="space-y-4">
          <AuthField id="name" label="Full name" errs={errors["name"]}>
            <input
              id="name"
              className="field"
              autoComplete="name"
              value={f.name}
              onChange={(e) => set("name")(e.target.value)}
              aria-invalid={!!errors["name"] || undefined}
            />
          </AuthField>
          <AuthField id="email" label="Email address" errs={errors["email"]}>
            <input
              id="email"
              type="email"
              className="field"
              autoComplete="email"
              value={f.email}
              onChange={(e) => set("email")(e.target.value)}
              aria-invalid={!!errors["email"] || undefined}
            />
          </AuthField>
          <AuthField
            id="phone"
            label="Phone number"
            errs={errors["phone"]}
            hint="10 digits, with or without +91."
          >
            <input
              id="phone"
              type="tel"
              className="field"
              autoComplete="tel"
              value={f.phone}
              onChange={(e) => set("phone")(e.target.value)}
              aria-invalid={!!errors["phone"] || undefined}
            />
          </AuthField>
          <AuthField
            id="password"
            label="Password"
            errs={errors["password"]}
            hint="At least 8 characters, with a letter and a number."
          >
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={f.password}
              onChange={set("password")}
              invalid={!!errors["password"]}
            />
          </AuthField>
          <AuthField id="confirm" label="Confirm password" errs={errors["confirm_password"]}>
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              value={f.confirm}
              onChange={set("confirm")}
              invalid={!!errors["confirm_password"]}
            />
          </AuthField>
          <div>
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                aria-invalid={!!errors["accepted_terms"] || undefined}
              />
              <label htmlFor="terms" className="text-sm">
                I accept the Terms and Conditions
              </label>
            </div>
            {errors["accepted_terms"]?.length ? (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {errors["accepted_terms"].join(" ")}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="btn-primary w-full" disabled={busy} aria-busy={busy}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm">
          Already have an account?{" "}
          {onSwitch ? <Button variant="link" className="h-auto p-0 font-semibold" onClick={onSwitch}>Sign in</Button> : <Link to="/signin" className="font-semibold text-primary underline">
            Sign in
          </Link>}
        </p>
      </div>
    </div>
  );
}
