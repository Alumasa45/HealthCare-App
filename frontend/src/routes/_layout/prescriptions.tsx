import Prescriptions from '@/components/Prescriptions'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/prescriptions')({
  component: Prescriptions,
})


