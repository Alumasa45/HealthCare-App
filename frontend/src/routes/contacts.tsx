import ContactUs from '@/components/Contacts'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contacts')({
  component: ContactUs,
})

