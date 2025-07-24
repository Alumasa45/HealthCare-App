import Chat from '@/components/Chat';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/chat')({
  component: Chat,
  beforeLoad: async () => {
    // Check if user is authenticated
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (!authToken || !userData) {
      console.log('No auth token or user data found, redirecting to login');
      throw redirect({
        to: '/login',
        replace: true
      });
    }
    
    try {
      const user = JSON.parse(userData);
      console.log('User data from localStorage:', user);
      return { user };
    } catch (error) {
      console.error('Failed to parse user data:', error);
      throw redirect({
        to: '/login',
        replace: true
      });
    }
  }
});