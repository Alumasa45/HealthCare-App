import AppointmentsPage from "@/components/doctor/AppointmentsPage";
import { createFileRoute } from "@tanstack/react-router";
//import AppointmentsPage from "@/components/doctor/AppointmentsPage";

export const Route = createFileRoute("/doctor/appointments")({
  component: AppointmentsPage,
});
