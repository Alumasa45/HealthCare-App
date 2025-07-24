import HealthBlog from '@/components/HealthBlog'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/healthblog')({
  component: HealthBlog,
})


