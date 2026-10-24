import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductImage } from "@/components/ProductCard";
import { StockNotices } from "@/components/StockNotices";
import { Empty, Loading } from "@/components/States";
import { api, ApiError, formatPrice, type OrderRequest } from "@/lib/api";
import { getAttribution } from "@/lib/attribution";
import { useCartLines } from "@/lib/useCartLines";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — CartNova" },
      { name: "description", content: "Securely complete your CartNova order." },
      { property: "og:title", content: "Checkout — CartNova" },
      { property: "og:description", content: "Securely complete your CartNova order." },
    ],
  }),
  component: CheckoutPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Form = { name: string; email: string; phone: string; line1: string; city: string; state: string; postal_code: string };
const empty: Form = { name: "", email: "", phone: "", line1: "", city: "", state: "", postal_code: "" };

function CheckoutPage() {
  const { cart, products, lines, currency, subtotal, notices, setNotices, nameOf } = useCartLines();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const keyRef = useRef<string | null>(null);
  const cartSig = JSON.stringify(cart.items);

  // One idempotency key per checkout attempt; a new one only when the order contents change.
  useEffect(() => {
    keyRef.current = crypto.randomUUID();
  }, [cartSig]);

  if (!cart.ready || (cart.items.length > 0 && products.isPending)) return <Loading label="Preparing checkout…" />;
  if (cart.items.length === 0)
    return (
      <div className="mx-auto max-w-7xl px-4">
        <StockNotices notices={notices} nameOf={nameOf} onDismiss={() => setNotices([])} />
        <Empty title="Your cart is empty">
          <Link to="/" className="btn-primary">Continue shopping</Link>
        </Empty>
      </div>
    );

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const blocked = lines.some((l) => !l.product || l.qty > l.available);

  const validate = () => {
    const e: Record<string, string[]> = {};
    if (!form.name.trim()) e["customer.name"] = ["Please enter your full name."];
    if (!form.email.trim()) e["customer.email"] = ["Please enter your email."];
    else if (!EMAIL_RE.test(form.email.trim())) e["customer.email"] = ["Please enter a valid email address."];
    if (!form.phone.trim()) e["customer.phone"] = ["Please enter your phone number."];
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting) return;
    setBanner(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    const hasAddress = [form.line1, form.city, form.state, form.postal_code].some((s) => s.trim());
    const body: OrderRequest = {
      idempotency_key: keyRef.current ?? crypto.randomUUID(),
      customer: { name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() },
      ...(hasAddress
        ? { shipping_address: { line1: form.line1.trim(), city: form.city.trim(), state: form.state.trim(), postal_code: form.postal_code.trim() } }
        : {}),
      items: cart.items.map(({ sku, qty }) => ({ sku, qty })),
      source: getAttribution(),
    };
    setSubmitting(true);
    try {
      const order = await api.createOrder(body);
      sessionStorage.setItem(`cartnova:order:${order.ref}`, JSON.stringify(order));
      cart.clear();
      navigate({ to: "/order/$ref", params: { ref: order.ref } });
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError("other", "Something went wrong. Please try again.");
      if (e.kind === "insufficient_stock") {
        const avail: Record<string, number> = {};
        for (const it of e.body?.items ?? []) avail[it.sku] = Number(it.available) || 0;
        const changes = cart.clampTo(avail);
        setNotices(changes.length ? changes : Object.entries(avail).map(([sku, to]) => ({ sku, from: to, to })));
        qc.invalidateQueries({ queryKey: ["stock"] });
        setBanner("Some items in your cart no longer have enough stock. We've updated your cart — please review and place your order again.");
      } else if (e.kind === "validation") {
        const errs = e.body?.errors ?? {};
        setErrors(errs);
        const fieldless = Object.entries(errs).filter(([k]) => !FIELD_KEYS.includes(k));
        setBanner(fieldless.length ? fieldless.map(([k, m]) => `${k}: ${(m as string[]).join(" ")}`).join(" • ") : e.message);
      } else {
        setBanner(`${e.message} Your cart has been saved.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold"><Lock className="h-5 w-5 text-success" /> Checkout</h1>
      <p className="mb-5 text-sm text-muted-foreground">Fields marked * are required.</p>
      <StockNotices notices={notices} nameOf={nameOf} onDismiss={() => setNotices([])} />
      {banner && <div className="panel mb-4 border-destructive p-4 text-sm font-medium text-destructive" role="alert">{banner}</div>}
      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <fieldset className="panel p-5">
            <legend className="px-1 text-lg font-bold">1. Contact information</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Full name *" errs={errors["customer.name"] ?? errors["name"]} className="sm:col-span-2">
                <input id="name" className="field" autoComplete="name" value={form.name} onChange={set("name")} />
              </Field>
              <Field id="email" label="Email *" errs={errors["customer.email"] ?? errors["email"]}>
                <input id="email" type="email" className="field" autoComplete="email" value={form.email} onChange={set("email")} onBlur={() => setForm((f) => ({ ...f, email: f.email.trim().toLowerCase() }))} />
              </Field>
              <Field id="phone" label="Phone *" errs={errors["customer.phone"] ?? errors["phone"]}>
                <input id="phone" type="tel" className="field" autoComplete="tel" value={form.phone} onChange={set("phone")} />
              </Field>
            </div>
          </fieldset>
          <fieldset className="panel p-5">
            <legend className="px-1 text-lg font-bold">2. Shipping address <span className="text-sm font-normal text-muted-foreground">(optional)</span></legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <Field id="line1" label="Address line" errs={errors["shipping_address.line1"]} className="sm:col-span-2">
                <input id="line1" className="field" autoComplete="address-line1" value={form.line1} onChange={set("line1")} />
              </Field>
              <Field id="city" label="City" errs={errors["shipping_address.city"]}>
                <input id="city" className="field" autoComplete="address-level2" value={form.city} onChange={set("city")} />
              </Field>
              <Field id="state" label="State" errs={errors["shipping_address.state"]}>
                <input id="state" className="field" autoComplete="address-level1" value={form.state} onChange={set("state")} />
              </Field>
              <Field id="postal_code" label="Postal code" errs={errors["shipping_address.postal_code"]}>
                <input id="postal_code" className="field" autoComplete="postal-code" value={form.postal_code} onChange={set("postal_code")} />
              </Field>
            </div>
          </fieldset>
        </div>
        <aside className="panel h-fit p-5" aria-label="Order summary">
          <h2 className="text-lg font-bold">3. Order summary</h2>
          <ul className="my-4 space-y-3">
            {lines.map((l) => (
              <li key={l.sku} className="flex gap-3 text-sm">
                <ProductImage src={l.product?.image_url ?? ""} alt="" className="h-14 w-14 shrink-0 rounded object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-medium">{l.product?.name ?? l.sku}</p>
                  <p className="text-muted-foreground">Qty {l.qty}</p>
                </div>
                <span className="font-semibold">{l.product ? formatPrice(l.lineTotal, l.product.currency) : "—"}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-border pt-3 text-lg font-bold">
            <span>Estimated total</span>
            <span>{formatPrice(subtotal, currency)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Prices and stock are confirmed by CartNova when you place the order.</p>
          <button type="submit" className="btn-primary mt-4 w-full" disabled={submitting || blocked} aria-busy={submitting}>
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing order…</> : "Place your order"}
          </button>
          {blocked && <p className="mt-2 text-sm text-destructive">Some items are unavailable. <Link to="/cart" className="underline">Review cart</Link></p>}
        </aside>
      </form>
    </div>
  );
}

const FIELD_KEYS = ["customer.name", "customer.email", "customer.phone", "name", "email", "phone", "shipping_address.line1", "shipping_address.city", "shipping_address.state", "shipping_address.postal_code"];

function Field({ id, label, errs, className, children }: { id: string; label: string; errs?: string[] | undefined; className?: string | undefined; children: React.ReactElement }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
      {errs?.length ? <p id={`${id}-err`} className="mt-1 text-sm text-destructive" role="alert">{errs.join(" ")}</p> : null}
    </div>
  );
}
