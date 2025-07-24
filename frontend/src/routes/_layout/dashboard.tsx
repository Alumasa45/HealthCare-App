import Dashboard from '@/components/Dashboard'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/_layout/dashboard')({
  component: Dashboard,
  beforeLoad: async () => {
    // Access the auth context directly
    const authToken = localStorage.getItem('authToken')
    const userData = localStorage.getItem('currentUser')
    
    if (!authToken || !userData) {
      console.log('No auth token or user data found, redirecting to login')
      throw redirect({
        to: '/login',
        replace: true
      })
    }
    
    try {
      const user = JSON.parse(userData)
      console.log('User data from localStorage:', user)
      return { user }
    } catch (error) {
      console.error('Failed to parse user data:', error)
      throw redirect({
        to: '/login',
        replace: true
      })
    }
  }
})

