import Services from '@/components/Services'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/services')({
  component: Services,
})

