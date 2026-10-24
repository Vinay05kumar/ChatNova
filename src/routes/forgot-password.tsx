import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — CartNova" },
      { name: "description", content: "Password reset for CartNova accounts." },
      { property: "og:title", content: "Forgot password — CartNova" },
      { property: "og:description", content: "Password reset for CartNova accounts." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="panel p-8 text-center">
        <p className="text-lg font-bold">Password reset is not available yet</p>
      </div>
    </div>
  ),
});
