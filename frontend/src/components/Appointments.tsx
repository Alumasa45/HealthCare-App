import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentApi } from "@/api/appointments";
import { AppointmentBooking } from "./AppointmentBooking";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";
import type { Appointment } from "@/api/interfaces/appointment";

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (appointmentId: number) => void;
}

function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onCancel,
}: AppointmentDetailsModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string | Date) => {
    if (!timeString) return "N/A";
    if (typeof timeString === "string" && timeString.includes(":")) {
      return timeString.substring(0, 5);
    }
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "No Show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const canCancel =
    appointment.Status === "Scheduled" || appointment.Status === "Confirmed";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Appointment Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Appointment #{appointment.Appointment_id}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                appointment.Status
              )}`}
            >
              {appointment.Status}
            </span>
          </div>

          {/* Appointment Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Date & Time
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">
                    {formatDate(appointment.Appointment_Date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">
                    {formatTime(appointment.Appointment_Time)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Appointment Type
              </h3>
              <p className="text-lg font-medium text-purple-600">
                {appointment.Appointment_Type}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Reason for Visit
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {appointment.Reason_For_Visit}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Payment Status
              </h3>
              <div className="flex items-center gap-2">
                {appointment.Payment_Status === "Paid" ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">Paid</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-600">
                      {appointment.Payment_Status}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {appointment.Notes && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Additional Notes
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {appointment.Notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {!showCancelConfirm ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {canCancel && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Appointment
                  </button>
                )}
              </>
            ) : (
              <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3 text-red-800 dark:text-red-200">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-semibold">Confirm Cancellation</span>
                </div>
                <p className="text-red-700 dark:text-red-300 mb-4">
                  Are you sure you want to cancel this appointment? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Keep Appointment
                  </button>
                  <button
                    onClick={() => {
                      onCancel(appointment.Appointment_id);
                      setShowCancelConfirm(false);
                      onClose();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.User_id) return;

      try {
        setLoading(true);
        const appointmentsData = await appointmentApi.getByUserId(
          Number(user.User_id)
        );
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await appointmentApi.update(appointmentId, { Status: "Cancelled" });
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.Appointment_id === appointmentId
            ? { ...apt, Status: "Cancelled" }
            : apt
        )
      );
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string | Date) => {
    if (!timeString) return "N/A";
    if (typeof timeString === "string" && timeString.includes(":")) {
      return timeString.substring(0, 5);
    }
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-purple-100 text-purple-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "No Show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full min-h-screen bg-white dark:bg-gray-900 p-4 md:p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Appointments</h2>
        <AppointmentBooking />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.isArray(appointments) &&
            appointments.map((appointment) => (
              <div
                key={appointment.Appointment_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">
                    Appointment #{appointment.Appointment_id}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      appointment.Status
                    )}`}
                  >
                    {appointment.Status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium">
                        {formatDate(appointment.Appointment_Date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-medium">
                        {formatTime(appointment.Appointment_Time)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Type:
                    </span>{" "}
                    {appointment.Appointment_Type}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Reason:
                    </span>{" "}
                    {appointment.Reason_For_Visit}
                  </p>
                  {appointment.Notes && (
                    <p>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Notes:
                      </span>{" "}
                      {appointment.Notes.length > 50
                        ? `${appointment.Notes.substring(0, 50)}...`
                        : appointment.Notes}
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Payment:
                    </span>{" "}
                    <span
                      className={
                        appointment.Payment_Status === "Paid"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }
                    >
                      {appointment.Payment_Status === "Paid" ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />{" "}
                          {appointment.Payment_Status}
                        </span>
                      )}
                    </span>
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => handleViewDetails(appointment)}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    View Details
                  </button>
                  {(appointment.Status === "Scheduled" ||
                    appointment.Status === "Confirmed") && (
                    <button
                      onClick={() =>
                        handleCancelAppointment(appointment.Appointment_id)
                      }
                      className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <CalendarDays className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No appointments found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You don't have any appointments scheduled yet.
          </p>
          <AppointmentBooking />
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
          onCancel={handleCancelAppointment}
        />
      )}
    </div>
  );
}
