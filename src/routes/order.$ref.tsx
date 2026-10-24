import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { Empty, Loading } from "@/components/States";
import { formatPrice, type OrderResponse } from "@/lib/api";

export const Route = createFileRoute("/order/$ref")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.ref} confirmed — CartNova` },
      { name: "description", content: "Your CartNova order confirmation." },
      { property: "og:title", content: "Order confirmed — CartNova" },
      { property: "og:description", content: "Your CartNova order confirmation." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { ref } = Route.useParams();
  const [order, setOrder] = useState<OrderResponse | null | undefined>(undefined);
  useEffect(() => {
    try {
      setOrder(JSON.parse(sessionStorage.getItem(`cartnova:order:${ref}`) || "null"));
    } catch {
      setOrder(null);
    }
  }, [ref]);

  if (order === undefined) return <Loading />;
  if (!order)
    return (
      <Empty title={`Order ${ref}`}>
        <p className="mb-4">Order details are only shown right after checkout. Check your email for your confirmation.</p>
        <Link to="/" className="btn-primary">Continue shopping</Link>
      </Empty>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="panel p-6 md:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-9 w-9 shrink-0 text-success" />
          <div>
            <h1 className="text-2xl font-bold">Thank you, your order has been placed.</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Order reference <span className="font-mono font-bold text-foreground">{order.ref}</span> · Status{" "}
              <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold uppercase text-accent-foreground">{order.status}</span>
            </p>
            {order.created_at && <p className="text-xs text-muted-foreground">Placed {new Date(order.created_at).toLocaleString()}</p>}
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          A confirmation email is being sent to <span className="font-semibold">{order.customer.email}</span>.
        </div>
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-center font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Price</th>
              <th className="py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.sku} className="border-b border-border">
                <td className="py-3">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">SKU {i.sku}</p>
                </td>
                <td className="py-3 text-center">{i.qty}</td>
                <td className="py-3 text-right">{formatPrice(i.unit_price, order.currency)}</td>
                <td className="py-3 text-right font-semibold">{formatPrice(i.line_total, order.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-between text-lg font-bold">
          <span>Order total ({order.currency})</span>
          <span>{formatPrice(order.total, order.currency)}</span>
        </div>
        <Link to="/" className="btn-primary mt-6">Continue shopping</Link>
      </div>
    </div>
  );
}
