import PatientsPage from "@/components/doctor/PatientsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/doctor/patients")({
  component: PatientsPage,
});
