import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export function AccountMenu() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      await logout();
      toast.success("You have been signed out.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign out failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const label = (top: string, bottom: string) => (
    <>
      <User className="h-5 w-5" />
      <span className="hidden text-left leading-tight sm:block">
        <span className="block max-w-32 truncate text-xs opacity-75">{top}</span>
        <span className="flex items-center gap-0.5 font-bold">{bottom} <ChevronDown className="h-3 w-3" /></span>
      </span>
    </>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-ring flex items-center gap-2 rounded px-2 py-1 text-sm" aria-label="Account menu">
        {status === "signed_in" && user ? label(`Hello, ${user.name}`, "Account") : label("Hello, guest", "Account")}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {status === "signed_in" && user ? (
          <>
            <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={busy} onSelect={(e) => { e.preventDefault(); void signOut(); }}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing out…</> : "Sign out"}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild><Link to="/signin">Sign in</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/signup">Sign up</Link></DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
