import DoctorDashboard from '@/components/dashboards/DoctorDashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/doctorDashboard')({
  component: DoctorDashboard,
})

