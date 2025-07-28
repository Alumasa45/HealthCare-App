import ReportsPage from "@/components/doctor/ReportsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/doctor/reports")({
  component: ReportsPage,
});
