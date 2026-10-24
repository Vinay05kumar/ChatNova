import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingCart, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useProducts } from "@/lib/queries";

export function Header() {
  const { count } = useCart();
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.search as { q?: string | undefined; category?: string | undefined } });
  const [q, setQ] = useState(search.q ?? "");
  useEffect(() => setQ(search.q ?? ""), [search.q]);
  const { data } = useProducts();
  const categories = [...new Set((data ?? []).map((p) => p.category).filter(Boolean))].sort();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/", search: { q: q.trim() || undefined, category: search.category } });
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-nav text-nav-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:gap-6">
          <Link to="/" search={{}} className="focus-ring rounded text-2xl font-extrabold tracking-tight">
            Cart<span className="text-primary">Nova</span>
          </Link>
          <form onSubmit={submit} role="search" className="order-3 flex w-full overflow-hidden rounded-md md:order-none md:flex-1">
            <label htmlFor="site-search" className="sr-only">Search products</label>
            <input
              id="site-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search CartNova"
              className="min-w-0 flex-1 bg-card px-4 py-2.5 text-sm text-foreground focus-visible:outline-none"
            />
            <button type="submit" aria-label="Search" className="bg-primary px-4 text-primary-foreground hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
              <Search className="h-5 w-5" />
            </button>
          </form>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <span className="hidden items-center gap-2 rounded px-2 py-1 text-sm sm:flex">
              <User className="h-5 w-5" />
              <span className="leading-tight">
                <span className="block text-xs opacity-75">Hello, guest</span>
                <span className="font-bold">Account</span>
              </span>
            </span>
            <Link to="/cart" className="focus-ring relative flex items-center gap-1 rounded px-2 py-1 font-bold" aria-label={`Cart, ${count} items`}>
              <span className="relative">
                <ShoppingCart className="h-7 w-7" />
                <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-primary px-1 text-center text-xs font-bold text-primary-foreground">{count}</span>
              </span>
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </div>
      <nav aria-label="Categories" className="bg-nav-2 text-nav-foreground">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-1.5 text-sm">
          <Link to="/" search={{}} className="focus-ring whitespace-nowrap rounded px-3 py-1 font-semibold hover:bg-nav">
            All products
          </Link>
          {categories.map((c) => (
            <Link key={c} to="/" search={{ category: c }} className="focus-ring whitespace-nowrap rounded px-3 py-1 hover:bg-nav" activeProps={{ className: "bg-nav" }}>
              {c}
            </Link>
          ))}
          <Link to="/cart" className="focus-ring ml-auto whitespace-nowrap rounded px-3 py-1 hover:bg-nav">Your cart</Link>
          <Link to="/checkout" className="focus-ring whitespace-nowrap rounded px-3 py-1 hover:bg-nav">Checkout</Link>
        </div>
      </nav>
    </header>
  );
}
