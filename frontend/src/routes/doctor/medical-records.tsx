import MedicalRecordsPage from "@/components/doctor/MedicalRecordsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/doctor/medical-records")({
  component: MedicalRecordsPage,
});
