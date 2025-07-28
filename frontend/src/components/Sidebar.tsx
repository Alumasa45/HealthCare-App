import { Link } from "@tanstack/react-router";
import {
  CalendarCheck2,
  LayoutDashboard,
  Library,
  MessagesSquare,
  ReceiptText,
  Settings,
  Tablets,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NavUser } from "./logout";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Define navigation items based on user type
  const getNavigationItems = () => {
    const userType = user?.User_Type;

    // Admin-specific navigation
    if (userType === "Admin") {
      return [
        {
          to: "/dashboard",
          icon: LayoutDashboard,
          label: "Admin Dashboard",
          show: true,
        },
        {
          to: "/admin/users",
          icon: MessagesSquare,
          label: "User Management",
          show: true,
        },
        {
          to: "/admin/registrations",
          icon: ReceiptText,
          label: "Professional Registrations",
          show: true,
        },
        {
          to: "/admin/system",
          icon: Settings,
          label: "System Settings",
          show: true,
        },
        {
          to: "/admin/reports",
          icon: Library,
          label: "Reports & Analytics",
          show: true,
        },
      ];
    }

    // Common items for non-admin users
    const commonItems = [
      {
        to: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        show: true,
      },
      {
        to: "/chat",
        icon: MessagesSquare,
        label: "Chat",
        show: true,
      },
      {
        to: "/billing",
        icon: ReceiptText,
        label: "Billing",
        show: true,
      },
      {
        to: "/settings",
        icon: Settings,
        label: "Settings",
        show: true,
      },
    ];

    // Items specific to user types
    const userSpecificItems = [
      {
        to: "/appointments",
        icon: CalendarCheck2,
        label: "Appointments",
        show: userType === "Patient" || userType === "Doctor",
      },
      {
        to: "/records",
        icon: Library,
        label: "Medical Records",
        show: userType === "Patient" || userType === "Doctor",
      },
      {
        to: "/prescriptions",
        icon: Tablets,
        label: "Prescriptions",
        show: userType === "Patient" || userType === "Doctor",
      },
    ];

    return [...commonItems, ...userSpecificItems].filter((item) => item.show);
  };

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
          ${isOpen ? "left-0" : "-left-64"} md:left-0`}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-wide text-center"></h2>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {getNavigationItems().map((item, index) => {
              const IconComponent = item.icon;
              return (
                <li key={index}>
                  <Link
                    to={item.to}
                    className="flex items-center gap-2 py-2 px-4 rounded hover:bg-purple-500 transition font-bold bg-purple-100 dark:bg-purple-900/30"
                    activeProps={{ className: "bg-purple-500" }}
                    onClick={() => setIsOpen(false)}
                  >
                    <IconComponent className="text-purple-600" />
                    {item.label}
                  </Link>
                </li>
              );
            })}

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
  );
}

export default Sidebar;
