import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignUpForm } from "@/components/SignUpForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — CartNova" },
      { name: "description", content: "Create your CartNova account." },
      { property: "og:title", content: "Create account — CartNova" },
      { property: "og:description", content: "Create your CartNova account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  return <SignUpForm onSuccess={() => { void navigate({ to: "/" }); }} />;
}
