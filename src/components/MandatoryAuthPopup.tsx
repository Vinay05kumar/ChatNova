import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function MandatoryAuthPopup({ homepage }: { homepage: boolean }) {
  const { status } = useAuth();
  const [elapsed, setElapsed] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (!homepage) return;
    const timer = window.setTimeout(() => setElapsed(true), 2000);
    return () => window.clearTimeout(timer);
  }, [homepage]);

  // Wait for the cookie-session check even if it takes longer than the timer.
  // Keep the gate across navigation once the homepage timer has elapsed.
  const open = elapsed && status === "signed_out";
  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-lg bg-card p-6 motion-reduce:animate-none sm:p-8"
      >
        <DialogTitle className="text-2xl font-bold tracking-normal">CartNova</DialogTitle>
        <DialogDescription>{mode === "signin" ? "Sign in to your account." : "Create your account."}</DialogDescription>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Account options">
          <Button variant={mode === "signin" ? "default" : "outline"} aria-pressed={mode === "signin"} onClick={() => setMode("signin")}>Sign In</Button>
          <Button variant={mode === "signup" ? "default" : "outline"} aria-pressed={mode === "signup"} onClick={() => setMode("signup")}>Sign Up</Button>
        </div>
        {mode === "signin" ? (
          <SignInForm embedded onSwitch={() => setMode("signup")} onSuccess={() => {}} />
        ) : (
          <SignUpForm embedded onSwitch={() => setMode("signin")} onSuccess={() => {}} />
        )}
      </DialogContent>
    </Dialog>
  );
}