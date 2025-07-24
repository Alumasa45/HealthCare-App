import Records from '@/components/records'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/records')({
  component: Records,
})

