import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignInForm } from "@/components/SignInForm";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — CartNova" },
      { name: "description", content: "Sign in to your CartNova account." },
      { property: "og:title", content: "Sign in — CartNova" },
      { property: "og:description", content: "Sign in to your CartNova account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  return <SignInForm onSuccess={() => { void navigate({ to: "/" }); }} />;
}
