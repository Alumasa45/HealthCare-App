import { createFileRoute } from '@tanstack/react-router'
import SignUpForm from '@/components/SignUp'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/signUp')({
  component: SignUpComponent,
})

function SignUpComponent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  return <SignUpForm />;
}

