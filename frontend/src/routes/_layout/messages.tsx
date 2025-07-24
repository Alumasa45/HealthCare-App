import Messages from '@/components/Messages'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/messages')({
  component: Messages,
})


