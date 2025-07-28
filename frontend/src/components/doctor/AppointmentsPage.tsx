import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { appointmentApi } from "@/api/appointments";
import { useAuth } from "@/contexts/AuthContext";
import { doctorApi } from "@/api/doctors";
import { toast } from "sonner";
import type { Appointment } from "@/api/interfaces/appointment";

interface ExtendedAppointment extends Appointment {
  Reason?: string;
  patient?: {
    Patient_id: number;
    User_id: number;
    user?: {
      First_Name?: string;
      Last_Name?: string;
      Email?: string;
      Phone?: string;
    };
  };
}

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    fetchAppointments();
  }, [user?.User_id]);

  const fetchAppointments = async () => {
    if (!user?.User_id) return;

    try {
      setLoading(true);
      setError(null);

      // Get doctor ID
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
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments");
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    appointmentId: number,
    status:
      | "Scheduled"
      | "Confirmed"
      | "In Progress"
      | "Completed"
      | "Cancelled"
      | "No Show"
  ) => {
    try {
      await appointmentApi.update(appointmentId, { Status: status });
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.Appointment_id === appointmentId
            ? { ...apt, Status: status }
            : apt
        )
      );
      toast.success("Appointment status updated");
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Cancelled":
      case "No Show":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "In Progress":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
      case "No Show":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (activeFilter === "all") return true;
    return apt.Status?.toLowerCase() === activeFilter.toLowerCase();
  });

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
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Appointments
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAppointments}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
        <p className="text-gray-600">Manage your patient appointments</p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              "all",
              "scheduled",
              "confirmed",
              "in progress",
              "completed",
              "cancelled",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeFilter === filter
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {filter === "all" ? "All" : filter}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {filter === "all"
                    ? appointments.length
                    : appointments.filter(
                        (apt) =>
                          apt.Status?.toLowerCase() === filter.toLowerCase()
                      ).length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Appointments list */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600">
              {activeFilter === "all"
                ? "You have no appointments yet."
                : `No ${activeFilter} appointments found.`}
            </p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.Appointment_id}
              className="bg-white rounded-lg shadow border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {appointment.patient?.user?.First_Name}{" "}
                      {appointment.patient?.user?.Last_Name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Patient ID: {appointment.Patient_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(appointment.Status || "Scheduled")}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      appointment.Status || "Scheduled"
                    )}`}
                  >
                    {appointment.Status || "Scheduled"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(
                      appointment.Appointment_Date
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {typeof appointment.Appointment_Time === "object"
                      ? appointment.Appointment_Time.toLocaleTimeString()
                      : appointment.Appointment_Time}
                  </span>
                </div>
                {appointment.patient?.user?.Email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {appointment.patient.user.Email}
                    </span>
                  </div>
                )}
              </div>

              {appointment.Reason && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Reason:</span>{" "}
                    {appointment.Reason}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                {appointment.Status !== "Completed" &&
                  appointment.Status !== "Cancelled" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            appointment.Appointment_id,
                            "Confirmed"
                          )
                        }
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            appointment.Appointment_id,
                            "In Progress"
                          )
                        }
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Start
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            appointment.Appointment_id,
                            "Completed"
                          )
                        }
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            appointment.Appointment_id,
                            "Cancelled"
                          )
                        }
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </>
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
