import { createFileRoute, redirect } from "@tanstack/react-router";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

export const Route = createFileRoute("/admin/users")({
  component: UserManagementPage,
  beforeLoad: async () => {
    // Check if user is authenticated and is admin
    const authToken = localStorage.getItem("authToken");
    const userData = localStorage.getItem("currentUser");

    if (!authToken || !userData) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }

    try {
      const user = JSON.parse(userData);
      if (user.User_Type !== "Admin") {
        throw redirect({
          to: "/dashboard",
          replace: true,
        });
      }
      return { user };
    } catch (error) {
      console.error("Failed to parse user data:", error);
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
});

function UserManagementPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <AdminDashboard />
    </div>
  );
}
