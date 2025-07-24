import Pharmacies from '@/components/Pharmacies'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pharmacies')({
  component: Pharmacies,
})


