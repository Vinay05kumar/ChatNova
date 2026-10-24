<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- CartNova is frontend-only: all product/stock/order data comes from the external Django REST API via src/lib/api.ts; never add mock data or a backend. Why: the backend is provided separately.
- Runtime config (API URL, poll intervals, low-stock threshold) lives in src/config/environment.ts, driven by VITE_* vars. Why: must be environment-configurable.
- The cart is persisted in localStorage as [{sku, qty}] only; prices are display-only and never sent in orders. Why: server is the source of truth for pricing.
