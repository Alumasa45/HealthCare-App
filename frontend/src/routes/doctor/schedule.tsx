import SchedulePage from "@/components/doctor/SchedulePage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/doctor/schedule")({
  component: SchedulePage,
});
