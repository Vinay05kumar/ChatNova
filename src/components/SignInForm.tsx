import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AuthField, Banner, PasswordInput } from "@/components/AuthFields";
import { extractErrors, isValidEmail, normalizeEmail, type FieldErrors } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function SignInForm({ onSuccess, onSwitch, embedded = false }: { onSuccess: () => void; onSwitch?: () => void; embedded?: boolean }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const em = normalizeEmail(email);
    const errs: FieldErrors = {};
    if (!em) errs["email"] = ["Enter your email address."];
    else if (!isValidEmail(em)) errs["email"] = ["Enter a valid email address."];
    if (!password) errs["password"] = ["Enter your password."];
    setErrors(errs);
    setBanner(null);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await login({ email: em, password });
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
        {!embedded && <h1 className="mb-5 text-2xl font-bold">Sign in</h1>}
        {banner && <Banner>{banner}</Banner>}
        <form onSubmit={submit} noValidate className="space-y-4">
          <AuthField id="email" label="Email address" errs={errors["email"]}>
            <input
              id="email"
              type="email"
              className="field"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors["email"] || undefined}
            />
          </AuthField>
          <AuthField id="password" label="Password" errs={errors["password"]}>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              invalid={!!errors["password"]}
            />
          </AuthField>
          {!embedded && <div className="text-right text-sm">
            <Link to="/forgot-password" className="text-primary underline">
              Forgot password?
            </Link>
          </div>}
          <Button type="submit" className="btn-primary w-full" disabled={busy} aria-busy={busy}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm">
          New to CartNova?{" "}
          {onSwitch ? <Button variant="link" className="h-auto p-0 font-semibold" onClick={onSwitch}>Create an account</Button> : <Link to="/signup" className="font-semibold text-primary underline">
            Create an account
          </Link>}
        </p>
      </div>
    </div>
  );
}
