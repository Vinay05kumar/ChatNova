import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Empty, ErrorState, Loading } from "@/components/States";
import { useProducts, useStock, availableFor } from "@/lib/queries";

type Sort = "relevance" | "price-asc" | "price-desc" | "name";
interface Search {
  q?: string | undefined;
  category?: string | undefined;
  sort?: Sort | undefined;
}

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    category: typeof s["category"] === "string" && s["category"] ? s["category"] : undefined,
    sort: ["price-asc", "price-desc", "name"].includes(s["sort"] as string) ? (s["sort"] as Sort) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "CartNova — Shop everyday essentials" },
      { name: "description", content: "Browse CartNova products with live stock, fast search and easy checkout." },
      { property: "og:title", content: "CartNova — Shop everyday essentials" },
      { property: "og:description", content: "Browse CartNova products with live stock, fast search and easy checkout." },
    ],
  }),
  component: Index,
});

function Index() {
  const { q, category, sort = "relevance" } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const products = useProducts();
  const list = products.data ?? [];
  const stock = useStock(list.map((p) => p.sku));
  const categories = [...new Set(list.map((p) => p.category).filter(Boolean))].sort();

  const shown = useMemo(() => {
    const term = q?.toLowerCase() ?? "";
    const r = list.filter(
      (p) =>
        (!category || p.category === category) &&
        (!term || `${p.name} ${p.description} ${p.category} ${p.sku}`.toLowerCase().includes(term)),
    );
    if (sort === "price-asc") r.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc") r.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "name") r.sort((a, b) => a.name.localeCompare(b.name));
    return r;
  }, [list, q, category, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{category ?? (q ? "Search results" : "All products")}</h1>
          {products.isSuccess && (
            <p className="text-sm text-muted-foreground">
              {shown.length} {shown.length === 1 ? "result" : "results"}
              {q && <> for “<span className="font-semibold text-foreground">{q}</span>”</>}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="text-sm">
            <span className="sr-only">Category</span>
            <select className="field" value={category ?? ""} onChange={(e) => navigate({ search: (s) => ({ ...s, category: e.target.value || undefined }) })}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="sr-only">Sort by</span>
            <select className="field" value={sort} onChange={(e) => navigate({ search: (s) => ({ ...s, sort: e.target.value === "relevance" ? undefined : (e.target.value as Sort) }) })}>
              <option value="relevance">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A–Z</option>
            </select>
          </label>
        </div>
      </div>

      {products.isPending ? (
        <Loading label="Loading products…" />
      ) : products.isError ? (
        <ErrorState message={(products.error as Error).message || "Couldn't load products."} onRetry={() => products.refetch()} />
      ) : list.length === 0 ? (
        <Empty title="No products available yet">Please check back soon.</Empty>
      ) : shown.length === 0 ? (
        <Empty title="No matching products">
          <button className="btn-secondary" onClick={() => navigate({ search: {} })}>Clear filters</button>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((p) => <ProductCard key={p.sku} product={p} stock={availableFor(p, p.sku, stock.data)} />)}
        </div>
      )}
    </div>
  );
}
