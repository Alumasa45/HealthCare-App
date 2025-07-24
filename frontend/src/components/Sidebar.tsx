import { Link } from '@tanstack/react-router'
import { CalendarCheck2, LayoutDashboard, Library, MessagesSquare, ReceiptText, Settings, Tablets, Menu, X, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { NavUser } from './logout'
import { useState } from 'react'

interface SidebarProps {
  className?: string
}

function Sidebar({ className}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div>
      <button
        onClick={toggleSidebar}
        className={`md:hidden top-4 left-4 z-50 p-2 rounded-md bg-purple-500 text-white shadow-lg hover:bg-purple-700 transition-colors ${className}`}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    <aside
        className={`bg-background text-foreground h-screen w-64 flex flex-col p-4 shadow-lg  transition-all duration-300 ease-in-out z-40
          ${isOpen ? 'left-0' : '-left-64'} md:left-0`}
      >
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-wide text-center"></h2>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          
          <li>
            <Link 
                to="/dashboard" 
                className="flex items-center gap-2 py-2 px-4 rounded hover:bg-purple-500 transition font-bold bg-purple-100 dark:bg-purple-900/30"
                activeProps={{ className: "bg-purple-500" }}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard />
                Dashboard
              </Link>
            </li>
          <li>
            </li>
            <li>
              <Link 
                to="/appointments" 
                className="flex items-center gap-2 py-2 px-4 rounded hover:bg-purple-500 transition font-bold bg-purple-100 dark:bg-purple-900/30"
                activeProps={{ className: "bg-purple-500" }}
                onClick={() => setIsOpen(false)}
              >
                <CalendarCheck2 className="text-purple-600" />
                Appointments
              </Link>
            </li>
            <li>
              <Link 
                to="/records" 
                className="flex items-center gap-2 py-2 px-4 rounded hover:bg-purple-500 transition font-bold bg-purple-100 dark:bg-purple-900/30"
                activeProps={{ className: "bg-purple-500" }}
                onClick={() => setIsOpen(false)}
              >
                <Library />
                Medical Records
              </Link>
            </li>
            <li>
              <Link 
                to="/prescriptions" 
                className="flex items-center gap-2 py-2 px-4 rounded hover:bg-purple-500 transition font-bold bg-purple-100 dark:bg-purple-900/30"
                activeProps={{ className: "bg-purple-500" }}
                onClick={() => setIsOpen(false)}
              >
                <Tablets />
                Prescriptions
              </Link>
            </li>
            <li>
              <Link 
                to="/chat" 
                className="flex items-center gap-2 py-2 px-4 rounded hover:bg-purple-500 transition font-bold bg-purple-100 dark:bg-purple-900/30"
                activeProps={{ className: "bg-purple-500" }}
                onClick={() => setIsOpen(false)}
              >
                <MessagesSquare />
                Chat
              </Link>
            </li>
            <li>
              <Link 
                to="/billing" 
                className="flex items-center gap-2 py-2 px-4 rounded hover:bg-purple-500 transition font-bold bg-purple-100 dark:bg-purple-900/30"
                activeProps={{ className: "bg-purple-500" }}
                onClick={() => setIsOpen(false)}
              >
                <ReceiptText />
                Billing
              </Link>
            </li>
            {user?.Doctor_id && (
              <li>
                <Link 
                  to="/doctor/slots" 
                  className="flex items-center gap-2 py-2 px-4 rounded hover:bg-purple-500 transition font-bold bg-purple-100 dark:bg-purple-900/30"
                  activeProps={{ className: "bg-purple-500" }}
                  onClick={() => setIsOpen(false)}
                >
                  <Clock className="text-purple-600" />
                  Manage Appointments
                </Link>
              </li>
            )}
            <li>
              <Link 
                to="/settings" 
                className="flex items-center gap-2 py-2 px-4 rounded hover:bg-purple-500 transition font-bold dark:bg-purple-900/30"
                activeProps={{ className: "bg-purple-500" }}
                onClick={() => setIsOpen(false)}
              >
                <Settings />
                Settings
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-2 py-2 px-4 rounded transition">
            <NavUser />
          </div>
        </nav>
        <div className="mt-8 text-center text-sm text-gray-400">
          © HealthCare Web App 2025.
        </div>
      </aside>

  {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}

export default Sidebar