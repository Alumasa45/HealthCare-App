import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/system")({
  component: SystemSettingsPage,
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

function SystemSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Application Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max File Upload Size (MB)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                defaultValue="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                defaultValue="30"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              Enable two-factor authentication
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              Require strong passwords
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              Enable login alerts
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Email Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Server
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="smtp.healthcare.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-md"
                defaultValue="587"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
