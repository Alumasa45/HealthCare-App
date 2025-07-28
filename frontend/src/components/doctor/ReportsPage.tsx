import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react";
import { appointmentApi } from "@/api/appointments";
import { useAuth } from "@/contexts/AuthContext";
import { doctorApi } from "@/api/doctors";
import { toast } from "sonner";

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month"
  );

  useEffect(() => {
    fetchData();
  }, [user?.User_id, timeRange]);

  const fetchData = async () => {
    if (!user?.User_id) return;

    try {
      setLoading(true);
      setError(null);

      let doctorId = user.Doctor_id;
      if (!doctorId && user.User_Type === "Doctor") {
        const doctorData = await doctorApi.findByUserId(user.User_id);
        doctorId = doctorData.Doctor_id;
      }

      if (!doctorId) {
        setError("Doctor ID not found");
        return;
      }

      const appointmentData = await appointmentApi.getByDoctorId(doctorId);
      setAppointments(appointmentData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter(
      (apt) => apt.Status === "Completed"
    ).length,
    upcomingAppointments: appointments.filter((apt) => {
      const aptDate = new Date(apt.Appointment_Date);
      const today = new Date();
      return (
        aptDate >= today &&
        apt.Status !== "Completed" &&
        apt.Status !== "Cancelled"
      );
    }).length,
    cancelledAppointments: appointments.filter(
      (apt) => apt.Status === "Cancelled"
    ).length,
  };

  // Appointment status distribution
  const statusData = [
    { name: "Completed", value: stats.completedAppointments, color: "#10B981" },
    { name: "Upcoming", value: stats.upcomingAppointments, color: "#3B82F6" },
    { name: "Cancelled", value: stats.cancelledAppointments, color: "#EF4444" },
  ];

  // Monthly appointment trends
  const monthlyData = appointments
    .reduce((acc, apt) => {
      const month = new Date(apt.Appointment_Date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const existing = acc.find((item: { month: string; appointments: number }) => item.month === month);
      if (existing) {
        existing.appointments += 1;
      } else {
        acc.push({ month, appointments: 1 });
      }
      return acc;
    }, [] as { month: string; appointments: number }[])
    .slice(-6); // Last 6 months

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Reports
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">
              Track your practice performance and patient statistics
            </p>
          </div>
          <div>
            <select
              value={timeRange}
              onChange={(e) =>
                setTimeRange(e.target.value as "week" | "month" | "year")
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAppointments}
              </p>
              <p className="text-gray-600">Total Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedAppointments}
              </p>
              <p className="text-gray-600">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.upcomingAppointments}
              </p>
              <p className="text-gray-600">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAppointments > 0
                  ? Math.round(
                      (stats.completedAppointments / stats.totalAppointments) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-gray-600">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Appointment Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Appointment Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Appointment Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {appointments.slice(0, 5).map((appointment, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    appointment.Status === "Completed"
                      ? "bg-green-500"
                      : appointment.Status === "Cancelled"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                ></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Appointment with Patient #{appointment.Patient_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(
                      appointment.Appointment_Date
                    ).toLocaleDateString()}{" "}
                    at {appointment.Appointment_Time}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {appointment.Status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
