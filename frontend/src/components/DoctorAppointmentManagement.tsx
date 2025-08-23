import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentApi } from "@/api/appointments";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, Clock, Calendar, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Appointment } from "@/api/interfaces/appointment";

export function DoctorAppointmentManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user?.Doctor_id) {
      fetchDoctorAppointments();
    }
  }, [user]);

  const fetchDoctorAppointments = async () => {
    if (!user?.Doctor_id) return;

    try {
      setLoading(true);
      const response = await appointmentApi.getByDoctorId(user.Doctor_id);
      setAppointments(response);
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      toast.error("Failed to load your appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    Appointment_id: number,
    status:
      | "Scheduled"
      | "Confirmed"
      | "In Progress"
      | "Completed"
      | "Cancelled"
      | "No Show"
  ) => {
    try {
      setLoading(true);
      await appointmentApi.update(Appointment_id, { Status: status });
      toast.success(`Appointment ${status.toLowerCase()}`);
      fetchDoctorAppointments();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy");
  };

  const formatTime = (time: string | Date) => {
    if (!time) return "N/A";
    if (typeof time === "string" && time.includes(":")) {
      return time.substring(0, 5);
    }
    return format(new Date(time), "hh:mm a");
  };

  const filteredAppointments =
    activeTab === "all"
      ? appointments
      : appointments.filter((appointment) =>
          activeTab === "pending"
            ? ["Scheduled", "Confirmed"].includes(appointment.Status)
            : activeTab === "completed"
            ? ["Completed"].includes(appointment.Status)
            : ["Cancelled", "No Show"].includes(appointment.Status)
        );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Patient Appointments</CardTitle>
        <CardDescription>
          View and manage appointments scheduled with you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Appointments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.Appointment_id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            Patient: {appointment.user?.First_Name || "Patient"}{" "}
                            {appointment.user?.Last_Name ||
                              `#${appointment.Patient_id}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>
                            Date: {formatDate(appointment.Appointment_Date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            Time: {formatTime(appointment.Appointment_Time)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Type: </span>
                          <span>{appointment.Appointment_Type}</span>
                        </div>
                        <div>
                          <span className="font-medium">Reason: </span>
                          <span>{appointment.Reason_For_Visit}</span>
                        </div>
                        <div>
                          <span className="font-medium">Status: </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.Status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : appointment.Status === "Cancelled" ||
                                  appointment.Status === "No Show"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {appointment.Status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 min-w-[150px]">
                        {["Scheduled", "Confirmed"].includes(
                          appointment.Status
                        ) && (
                          <>
                            <Button
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                              onClick={() =>
                                handleUpdateStatus(
                                  appointment.Appointment_id,
                                  "Confirmed"
                                )
                              }
                              disabled={
                                loading || appointment.Status === "Confirmed"
                              }
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                              onClick={() =>
                                handleUpdateStatus(
                                  appointment.Appointment_id,
                                  "Completed"
                                )
                              }
                              disabled={loading}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                              onClick={() =>
                                handleUpdateStatus(
                                  appointment.Appointment_id,
                                  "Cancelled"
                                )
                              }
                              disabled={loading}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {appointment.Status === "Completed" && (
                          <div className="text-center text-green-600 font-medium">
                            Appointment completed
                          </div>
                        )}
                        {["Cancelled", "No Show"].includes(
                          appointment.Status
                        ) && (
                          <div className="text-center text-red-600 font-medium">
                            Appointment {appointment.Status.toLowerCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p>
                  No {activeTab !== "all" ? activeTab : ""} appointments found.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
