import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/registrations")({
  component: RegistrationsPage,
  beforeLoad: async () => {
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
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
});

function RegistrationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Professional Registrations</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          Manage doctor and pharmacist registration applications
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-green-600">
              Pending Applications
            </h3>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-blue-600">Approved This Month</h3>
            <p className="text-2xl font-bold">8</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold text-red-600">
              Rejected Applications
            </h3>
            <p className="text-2xl font-bold">3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
