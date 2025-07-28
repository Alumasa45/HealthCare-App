import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
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

function ReportsPage() {
  // Sample data for reports
  const monthlyData = [
    { month: "Jan", appointments: 45, revenue: 1200 },
    { month: "Feb", appointments: 52, revenue: 1400 },
    { month: "Mar", appointments: 48, revenue: 1300 },
    { month: "Apr", appointments: 61, revenue: 1650 },
    { month: "May", appointments: 55, revenue: 1480 },
    { month: "Jun", appointments: 67, revenue: 1800 },
  ];

  const userTypeData = [
    { name: "Patients", value: 68, color: "#8884d8" },
    { name: "Doctors", value: 22, color: "#82ca9d" },
    { name: "Pharmacists", value: 10, color: "#ffc658" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Appointments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Appointments</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">User Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="font-medium">Total Users</span>
              <span className="text-2xl font-bold text-blue-600">1,247</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium">Active Sessions</span>
              <span className="text-2xl font-bold text-green-600">89</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
              <span className="font-medium">Pending Approvals</span>
              <span className="text-2xl font-bold text-yellow-600">12</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span className="font-medium">System Uptime</span>
              <span className="text-2xl font-bold text-purple-600">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
