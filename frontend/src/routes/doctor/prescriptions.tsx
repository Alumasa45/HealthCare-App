import PrescriptionsPage from "@/components/doctor/PrescriptionsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/doctor/prescriptions")({
  component: PrescriptionsPage,
});
