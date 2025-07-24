import { createFileRoute } from "@tanstack/react-router";
import Billing from "@/components/Billing";

export const Route = createFileRoute("/_layout/billing")({
  component: Billing,
});
