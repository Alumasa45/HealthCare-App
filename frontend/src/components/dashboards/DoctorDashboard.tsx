import React, { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  FileText,
  Clock,
  Check,
  X,
  User,
  Plus,
  Edit2,
  Trash2,
  Save,
  XCircle,
  Pill,
  Activity,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Slots } from "@/api/interfaces/appointmentSlot";
import { slotApi } from "@/api/appointmentSlots";
import type { User as UserType } from "@/api/interfaces/user";
import type { DoctorSchedule } from "@/api/interfaces/schedule";
import { scheduleApi } from "@/api/schedules";
import type { Appointment } from "@/api/interfaces/appointment";
import { appointmentApi } from "@/api/appointments";
import { doctorApi } from "@/api/doctors";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CreatePrescriptionModal } from "@/components/CreatePrescriptionModal";
import { MedicalRecordModal } from "@/components/MedicalRecordModal";
import FloatingFeathers from "@/components/FloatingFeathers";
import { recordsApi } from "@/api/records";
import type { MedicalRecords } from "@/api/interfaces/record";

type TabType =
  | "appointments"
  | "patients"
  | "prescriptions"
  | "medical-records"
  | "schedule"
  | "reports";

interface ExtendedAppointment extends Appointment {
  patient?: {
    Patient_id: number;
    User_id: number;
    user?: {
      First_Name?: string;
      Last_Name?: string;
      Email?: string;
    };
  };
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  console.log("user ", user);
  const { doctor } = useAuth();
  // const [schedule] = useState<DoctorSchedule[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("appointments");
  const [appointmentSubTab, setAppointmentSubTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentSlots, setAppointmentSlots] = useState<Slots[]>([]);
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [patients, setPatients] = useState<UserType[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [isCreatePrescriptionOpen, setIsCreatePrescriptionOpen] =
    useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecords[]>([]);
  const [isMedicalRecordModalOpen, setIsMedicalRecordModalOpen] =
    useState(false);
  const [selectedAppointmentForRecord, setSelectedAppointmentForRecord] =
    useState<ExtendedAppointment | null>(null);
  const [resolvedDoctorId, setResolvedDoctorId] = useState<number | null>(null);

  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(
    null
  );
  const [scheduleForm, setScheduleForm] = useState({
    Day_Of_The_Week: "",
    Start_Time: "",
    End_Time: "",
    Slot_Duration: 30,
    Is_Active: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.User_id) {
          console.warn("User ID not found in user object:", user);
          setError("User ID not found. Please contact support.");
          return;
        }

        // If Doctor_id is missing, try to fetch it from the backend
        let doctorId = user.Doctor_id;
        if (!doctorId && user.User_Type === "Doctor") {
          try {
            console.log(
              "Doctor_id missing, fetching doctor info for User_id:",
              user.User_id
            );
            const doctorData = await doctorApi.findByUserId(user.User_id);
            doctorId = doctorData.Doctor_id;
            console.log("Found Doctor_id:", doctorId);
          } catch (error) {
            console.error("Failed to fetch doctor data:", error);
            setError(
              "Unable to find doctor information. Please contact support."
            );
            return;
          }
        }

        // Set the resolved Doctor_id for use in modals
        if (doctorId) {
          setResolvedDoctorId(doctorId);
        } else {
          console.warn("Doctor ID not found:", user);
          setError("Doctor ID not found. Please contact support.");
          return;
        }

        if (!doctorId) {
          console.warn("Doctor ID not found:", user);
          setError("Doctor ID not found. Please contact support.");
          return;
        }

        // Fetch all required data in parallel
        const [slotData, scheduleData, appointmentData, medicalRecordsData] =
          await Promise.all([
            slotApi.findAll(),
            scheduleApi.findByDoctorId(doctorId),
            appointmentApi.getByDoctorId(doctorId),
            // Fetch medical records for patients with appointments
            recordsApi.findAll().catch((error) => {
              console.warn("Failed to fetch medical records:", error);
              return [];
            }),
          ]);

        setAppointmentSlots(slotData);
        setSchedules(scheduleData);
        setAppointments(appointmentData);
        setMedicalRecords(medicalRecordsData);

        // Extract unique patients from appointments
        const uniquePatients = new Map<
          number,
          ExtendedAppointment["patient"]
        >();

        // Add validation for appointmentData
        console.log("🔍 Appointment data structure:", appointmentData);
        console.log("🔍 Is array?", Array.isArray(appointmentData));

        // Ensure appointmentData is an array
        const appointmentsArray = Array.isArray(appointmentData)
          ? appointmentData
          : appointmentData &&
            typeof appointmentData === "object" &&
            "data" in appointmentData &&
            Array.isArray((appointmentData as any).data)
          ? (appointmentData as any).data
          : [];

        console.log(
          "🔍 Using appointments array:",
          appointmentsArray.length,
          "items"
        );

        (appointmentsArray as ExtendedAppointment[]).forEach((apt) => {
          if (
            apt.patient &&
            typeof apt.Patient_id === "number" &&
            !uniquePatients.has(apt.Patient_id)
          ) {
            uniquePatients.set(apt.Patient_id, apt.patient);
          }
        });
        setPatients(
          Array.from(uniquePatients.values())
            .filter((p) => !!p && !!p.user)
            .map((p) => ({
              User_id: p!.User_id,
              First_Name: p!.user?.First_Name ?? "",
              Last_Name: p!.user?.Last_Name ?? "",
              Email: p!.user?.Email ?? "",
              Password: "",
              Phone_Number: "",
              User_Type: "Patient",
              Date_of_Birth: "",
              Address: "",
              Gender: "Other",
              Account_Status: "Active", // Default or fetch actual status if available
              Created_at: new Date(), // Default or fetch actual date if available
            }))
        );

        console.log(
          `Loaded ${appointmentData.length} appointments, ${
            Array.from(uniquePatients.values()).length
          } patients, ${
            medicalRecordsData.length
          } medical records for doctor ${doctorId}`
        );
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch data."
        );
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh appointments every 2 minutes
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [user?.User_id]);

  // const fetchAppointments = async () => {
  //   if (!user?.User_id) return;

  //   let doctorId = user.Doctor_id;
  //   if (!doctorId && user.User_Type === "Doctor") {
  //     try {
  //       const doctorData = await doctorApi.findByUserId(user.User_id);
  //       doctorId = doctorData.Doctor_id;
  //     } catch (error) {
  //       console.error("Failed to fetch doctor data:", error);
  //       return;
  //     }
  //   }

  //   if (!doctorId) return;

  //   try {
  //     setLoading(true);
  //     const appointmentData = await appointmentApi.getByDoctorId(doctorId);
  //     setAppointments(appointmentData);
  //   } catch (error) {
  //     console.error("Error fetching doctor appointments:", error);
  //     toast.error("Failed to load appointments");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

      // Update the local state immediately for better UX
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.Appointment_id === Appointment_id
            ? { ...apt, Status: status }
            : apt
        )
      );

      toast.success(`Appointment ${status.toLowerCase()}`);

      // Refresh data from server to ensure consistency
      if (user?.User_id) {
        let doctorId = user.Doctor_id;
        if (!doctorId && user.User_Type === "Doctor") {
          try {
            const doctorData = await doctorApi.findByUserId(user.User_id);
            doctorId = doctorData.Doctor_id;
          } catch (error) {
            console.error("Failed to fetch doctor data:", error);
          }
        }

        if (doctorId) {
          const updatedAppointments = await appointmentApi.getByDoctorId(
            doctorId
          );
          setAppointments(updatedAppointments);
        }
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error(
        `Failed to update appointment status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    if (!user?.User_id) return;

    let doctorId = user.Doctor_id;
    if (!doctorId && user.User_Type === "Doctor") {
      try {
        const doctorData = await doctorApi.findByUserId(user.User_id);
        doctorId = doctorData.Doctor_id;
      } catch (error) {
        console.error("Failed to fetch doctor data:", error);
        return;
      }
    }

    if (!doctorId) return;

    try {
      const scheduleData = await scheduleApi.findByDoctorId(doctorId);
      setSchedules(scheduleData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to load schedules");
    }
  };

  const handleAddSchedule = async () => {
    if (!user?.User_id) {
      toast.error("User ID not found");
      return;
    }

    let doctorId = user.Doctor_id;
    if (!doctorId && user.User_Type === "Doctor") {
      try {
        const doctorData = await doctorApi.findByUserId(user.User_id);
        doctorId = doctorData.Doctor_id;
      } catch (error) {
        console.error("Failed to fetch doctor data:", error);
        toast.error("Unable to find doctor information");
        return;
      }
    }

    if (!doctorId) {
      toast.error("Doctor ID not found");
      return;
    }

    try {
      setLoading(true);
      await scheduleApi.create({
        Doctor_id: doctorId,
        ...scheduleForm,
      });
      toast.success("Schedule added successfully");
      setIsAddingSchedule(false);
      setScheduleForm({
        Day_Of_The_Week: "",
        Start_Time: "",
        End_Time: "",
        Slot_Duration: 30,
        Is_Active: true,
      });
      fetchSchedules();
    } catch (error) {
      console.error("Error adding schedule:", error);
      toast.error("Failed to add schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (Schedule_id: number) => {
    try {
      setLoading(true);
      await scheduleApi.update(Schedule_id, scheduleForm);
      toast.success("Schedule updated successfully");
      setEditingScheduleId(null);
      fetchSchedules();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (Schedule_id: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      setLoading(true);
      await scheduleApi.delete(Schedule_id);
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleScheduleStatus = async (schedule: DoctorSchedule) => {
    try {
      setLoading(true);
      await scheduleApi.update(schedule.Schedule_id, {
        Is_Active: !schedule.Is_Active,
      });
      toast.success(
        `Schedule ${!schedule.Is_Active ? "activated" : "deactivated"}`
      );
      fetchSchedules();
    } catch (error) {
      console.error("Error toggling schedule status:", error);
      toast.error("Failed to update schedule status");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlots = async () => {
    if (!user?.User_id) {
      toast.error("User ID not found");
      return;
    }

    let doctorId = user.Doctor_id;
    if (!doctorId && user.User_Type === "Doctor") {
      try {
        const doctorData = await doctorApi.findByUserId(user.User_id);
        doctorId = doctorData.Doctor_id;
      } catch (error) {
        console.error("Failed to fetch doctor data:", error);
        toast.error("Unable to find doctor information");
        return;
      }
    }

    if (!doctorId) {
      toast.error("Doctor ID not found");
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    try {
      setLoading(true);
      if (!user) {
        toast.error("User not found");
        setLoading(false);
        return;
      }

      if (schedules.length === 0) {
        toast.error(
          "No schedules found. Please create a schedule first before generating slots."
        );
        setLoading(false);
        return;
      }

      const activeSchedules = schedules.filter(
        (schedule) => schedule.Is_Active
      );
      if (activeSchedules.length === 0) {
        toast.error(
          "No active schedules found. Please activate at least one schedule before generating slots."
        );
        setLoading(false);
        return;
      }

      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      console.log("Generating slots with params:", {
        Doctor_id: doctorId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      //request to backendd.
      const result = await scheduleApi.generateSlots({
        Doctor_id: doctorId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
      console.log("Generated slots response:", result);

      let slotsCount = 0;
      if (result) {
        if (typeof result.slotsGenerated === "number") {
          slotsCount = result.slotsGenerated;
        } else if (result.message) {
          //try to extract the count from the message.
          const match = result.message.match(/\d+/);
          if (match) {
            slotsCount = parseInt(match[0], 10);
          }
        }
      }

      if (slotsCount > 0) {
        toast.success(
          `Generated ${slotsCount} appointment slots for the next 30 days`
        );
      } else {
        toast.warning(
          "No slots were generated. Please check your schedule settings and ensure they are active."
        );
      }

      const slotData = await slotApi.findAll();
      setAppointmentSlots(slotData);
    } catch (error: any) {
      console.error("Error generating slots:", error);

      //extract the error message from the response.
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      console.error("Error details:", errorMessage);

      if (errorMessage.includes("No schedules found")) {
        toast.error(
          "No schedules found for this doctor. Please create a schedule first."
        );
      } else if (errorMessage.includes("Invalid date format")) {
        toast.error("Invalid date format. Please check your date inputs.");
      } else if (
        errorMessage.includes("Doctor with ID") &&
        errorMessage.includes("not found")
      ) {
        toast.error("Doctor not found. Please check your account settings.");
      } else {
        toast.error(`Failed to generate appointment slots: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const startEditingSchedule = (schedule: DoctorSchedule) => {
    setEditingScheduleId(schedule.Schedule_id);
    setScheduleForm({
      Day_Of_The_Week: schedule.Day_Of_The_Week,
      Start_Time: schedule.Start_Time,
      End_Time: schedule.End_Time,
      Slot_Duration: schedule.Slot_Duration,
      Is_Active: schedule.Is_Active,
    });
  };

  const cancelEditing = () => {
    setEditingScheduleId(null);
    setIsAddingSchedule(false);
    setScheduleForm({
      Day_Of_The_Week: "",
      Start_Time: "",
      End_Time: "",
      Slot_Duration: 30,
      Is_Active: true,
    });
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    if (typeof date === "string") {
      if (date.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return date.slice(0, 5);
      }
      const dateObj = new Date(date);
      return dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderAppointments = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <div className="text-purple-600 ml-2">Loading appointments...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    const filteredAppointments =
      appointmentSubTab === "all"
        ? appointments
        : appointmentSubTab === "pending"
        ? appointments.filter((apt) =>
            ["Scheduled", "Confirmed"].includes(apt.Status)
          )
        : appointmentSubTab === "completed"
        ? appointments.filter((apt) => apt.Status === "Completed")
        : appointments.filter((apt) =>
            ["Cancelled", "No Show"].includes(apt.Status)
          );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Manage Appointments ({appointments.length})
          </h2>
          <button
            onClick={async () => {
              if (user?.User_id) {
                setLoading(true);
                try {
                  let doctorId = user.Doctor_id;
                  if (!doctorId && user.User_Type === "Doctor") {
                    try {
                      const doctorData = await doctorApi.findByUserId(
                        user.User_id
                      );
                      doctorId = doctorData.Doctor_id;
                    } catch (error) {
                      console.error("Failed to fetch doctor data:", error);
                      toast.error("Unable to find doctor information");
                      return;
                    }
                  }

                  if (doctorId) {
                    const updatedAppointments =
                      await appointmentApi.getByDoctorId(doctorId);
                    setAppointments(updatedAppointments);
                    toast.success("Appointments refreshed");
                  }
                } catch (error) {
                  toast.error("Failed to refresh appointments");
                } finally {
                  setLoading(false);
                }
              }
            }}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-50 light-purple:bg-healthcare-100 text-purple-700 light-purple:text-healthcare-800 border border-purple-200 light-purple:border-healthcare-300 rounded-md hover:bg-purple-100 light-purple:hover:bg-healthcare-200 transition-colors"
            disabled={loading}
          >
            <Clock className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "all", label: "All Appointments" },
            { id: "pending", label: "Pending" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAppointmentSubTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                appointmentSubTab === tab.id
                  ? "bg-purple-50 light-purple:bg-healthcare-100 text-purple-600 light-purple:text-healthcare-700 border-b-2 border-purple-500 light-purple:border-healthcare-500"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 light-purple:hover:bg-light-purple-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No {appointmentSubTab !== "all" ? appointmentSubTab : ""}{" "}
            appointments found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.Appointment_id}
                className="bg-white dark:bg-gray-800 light-purple:bg-light-purple-50 light-purple:border-light-purple-200 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        Patient:{" "}
                        {appointment.patient?.user?.First_Name || "Patient"}{" "}
                        {appointment.patient?.user?.Last_Name ||
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
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {appointment.Status}
                      </span>
                    </div>
                    {appointment.Notes && (
                      <div>
                        <span className="font-medium">Notes: </span>
                        <span className="text-gray-600">
                          {appointment.Notes}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[150px]">
                    {["Scheduled", "Confirmed"].includes(
                      appointment.Status
                    ) && (
                      <>
                        <button
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 hover:text-green-800 transition-colors disabled:opacity-50"
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
                          <Check className="h-4 w-4" />
                          Confirm
                        </button>
                        <button
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 light-purple:bg-healthcare-100 text-purple-700 light-purple:text-healthcare-800 border border-purple-200 light-purple:border-healthcare-300 rounded-md hover:bg-purple-100 light-purple:hover:bg-healthcare-200 hover:text-purple-800 light-purple:hover:text-healthcare-900 transition-colors disabled:opacity-50"
                          onClick={() =>
                            handleUpdateStatus(
                              appointment.Appointment_id,
                              "Completed"
                            )
                          }
                          disabled={loading}
                        >
                          <Check className="h-4 w-4" />
                          Complete
                        </button>
                        <button
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-800 transition-colors disabled:opacity-50"
                          onClick={() =>
                            handleUpdateStatus(
                              appointment.Appointment_id,
                              "Cancelled"
                            )
                          }
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </>
                    )}
                    {appointment.Status === "Completed" && (
                      <div className="text-center text-green-600 font-medium py-4">
                        Appointment completed
                      </div>
                    )}
                    {["Cancelled", "No Show"].includes(appointment.Status) && (
                      <div className="text-center text-red-600 font-medium py-4">
                        Appointment {appointment.Status.toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Available Slots ({appointmentSlots.length})
          </h3>
          {appointmentSlots.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No appointment slots found.
            </div>
          ) : (
            <div className="grid gap-3">
              {appointmentSlots.slice(0, 5).map((slot) => (
                <div
                  key={slot.Slot_id}
                  className="bg-gray-50 dark:bg-gray-700 light-purple:bg-light-purple-100 light-purple:border-light-purple-300 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium">
                        Date: {formatDate(slot.Slot_Date)}
                      </span>
                      <span className="ml-4">
                        Time: {formatTime(slot.Slot_Time)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          slot.Is_Available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {slot.Is_Available ? "Available" : "Unavailable"}
                      </span>
                      {slot.Is_Blocked && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {appointmentSlots.length > 5 && (
                <div className="text-center text-gray-500 text-sm">
                  ... and {appointmentSlots.length - 5} more slots
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPatients = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-purple-600">Loading Patients...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Patients ({patients.length})
          </h2>
        </div>

        {patients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No patients found.
          </div>
        ) : (
          <div className="grid gap-4">
            {patients.map((patient) => (
              <div
                key={patient.User_id}
                className="bg-white dark:bg-gray-800 light-purple:bg-light-purple-50 light-purple:border-light-purple-200 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 light-purple:border-light-purple-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                      Patient email : {patient.Email}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <div className="flex items-center gap-1">
                        Patient First Name :{patient.First_Name}
                      </div>
                      <div className="flex items-center gap-1">
                        Patient Last Name : {patient.Last_Name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSchedule = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-purple-600">Loading Schedule...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    const daysOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const sortedSchedules = schedules.sort(
      (a, b) =>
        daysOrder.indexOf(a.Day_Of_The_Week) -
        daysOrder.indexOf(b.Day_Of_The_Week)
    );

    const renderScheduleForm = (
      isEditing = false,
      schedule?: DoctorSchedule
    ) => (
      <div className="bg-purple-50 dark:bg-purple-900/20 light-purple:bg-healthcare-100 light-purple:border-healthcare-300 p-6 rounded-lg border border-purple-200 dark:border-purple-800 mb-4">
        <h4 className="text-lg font-semibold mb-4 text-purple-900 dark:text-purple-100">
          {isEditing ? "Edit Schedule" : "Add New Schedule"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day of Week
            </label>
            <select
              value={scheduleForm.Day_Of_The_Week}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  Day_Of_The_Week: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Day</option>
              {daysOrder.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={scheduleForm.Start_Time}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, Start_Time: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={scheduleForm.End_Time}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, End_Time: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slot Duration (mins)
            </label>
            <select
              value={scheduleForm.Slot_Duration}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  Slot_Duration: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>
        <div className="flex items-center mt-4 mb-4">
          <input
            type="checkbox"
            id="isActive"
            checked={scheduleForm.Is_Active}
            onChange={(e) =>
              setScheduleForm({ ...scheduleForm, Is_Active: e.target.checked })
            }
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isActive"
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            Active Schedule
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={
              isEditing
                ? () => handleUpdateSchedule(schedule!.Schedule_id)
                : handleAddSchedule
            }
            disabled={
              loading ||
              !scheduleForm.Day_Of_The_Week ||
              !scheduleForm.Start_Time ||
              !scheduleForm.End_Time
            }
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {isEditing ? "Update" : "Add"} Schedule
          </button>
          <button
            onClick={cancelEditing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Weekly Schedule ({schedules.length} days)
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateSlots}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Calendar className="h-4 w-4" />
              Generate Slots
            </button>
            <button
              onClick={() => setIsAddingSchedule(true)}
              disabled={loading || isAddingSchedule}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Schedule
            </button>
          </div>
        </div>

        {isAddingSchedule && renderScheduleForm()}

        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No schedule found. Set up your weekly schedule!
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedSchedules.map((schedule) => (
              <div key={schedule.Schedule_id}>
                {editingScheduleId === schedule.Schedule_id ? (
                  renderScheduleForm(true, schedule)
                ) : (
                  <div
                    className={`bg-white dark:bg-gray-800 light-purple:bg-light-purple-50 light-purple:border-light-purple-200 p-6 rounded-lg shadow-md border-l-4 ${
                      schedule.Is_Active ? "border-green-500" : "border-red-500"
                    } border border-gray-200 dark:border-gray-700`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {schedule.Day_Of_The_Week}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              schedule.Is_Active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {schedule.Is_Active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Start:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {formatTime(schedule.Start_Time)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              End:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {formatTime(schedule.End_Time)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Slot Duration:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100">
                              {schedule.Slot_Duration} min
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleToggleScheduleStatus(schedule)}
                          disabled={loading}
                          className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            schedule.Is_Active
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          } disabled:opacity-50`}
                        >
                          {schedule.Is_Active ? (
                            <>
                              <X className="h-3 w-3" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3" />
                              Activate
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => startEditingSchedule(schedule)}
                          disabled={loading}
                          className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm font-medium disabled:opacity-50"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteSchedule(schedule.Schedule_id)
                          }
                          disabled={loading}
                          className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {schedules.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Tip:</strong> After setting up your schedules, click
              "Generate Slots" to create appointment slots for the next 30 days
              based on your active schedules.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderPrescriptions = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Prescription Management
            </h3>
            <p className="text-gray-600">
              Create and manage prescriptions for your patients
            </p>
          </div>
          <button
            onClick={() => {
              if (!resolvedDoctorId) {
                toast.error(
                  "Doctor information not loaded. Please wait or refresh the page."
                );
                return;
              }
              setIsCreatePrescriptionOpen(true);
            }}
            disabled={!resolvedDoctorId}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Create Prescription
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 light-purple:bg-light-purple-50 light-purple:border-light-purple-200 rounded-lg border p-6">
          <div className="text-center py-12">
            <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Prescriptions Yet
            </h4>
            <p className="text-gray-600 mb-4">
              Start by creating your first prescription for a patient
            </p>
            <button
              onClick={() => {
                if (!resolvedDoctorId) {
                  toast.error(
                    "Doctor information not loaded. Please wait or refresh the page."
                  );
                  return;
                }
                setIsCreatePrescriptionOpen(true);
              }}
              disabled={!resolvedDoctorId}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Create First Prescription
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMedicalRecords = () => {
    const handleCreateRecord = (appointment: ExtendedAppointment) => {
      setSelectedAppointmentForRecord(appointment);
      setIsMedicalRecordModalOpen(true);
    };

    const fetchMedicalRecords = async () => {
      try {
        const records = await recordsApi.findAll();
        // Filter records by current doctor
        const doctorRecords = records.filter(
          (record) =>
            record.Doctor_id === (user?.Doctor_id || doctor?.Doctor_id)
        );
        setMedicalRecords(doctorRecords);
      } catch (error) {
        console.error("Error fetching medical records:", error);
        toast.error("Failed to load medical records");
      }
    };

    React.useEffect(() => {
      fetchMedicalRecords();
    }, [user?.Doctor_id, doctor?.Doctor_id]);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Medical Records
            </h3>
            <p className="text-gray-600">
              View and manage patient medical records from appointments
            </p>
          </div>
        </div>

        {/* Recent Appointments with Add Record option */}
        <div className="bg-white dark:bg-gray-800 light-purple:bg-light-purple-50 light-purple:border-light-purple-200 rounded-lg border p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 light-purple:text-healthcare-800 mb-4">
            Recent Appointments - Add Medical Records
          </h4>
          <div className="space-y-4">
            {appointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.Appointment_id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {appointment.patient?.user?.First_Name}{" "}
                    {appointment.patient?.user?.Last_Name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {appointment.Appointment_Date
                      ? new Date(
                          appointment.Appointment_Date
                        ).toLocaleDateString()
                      : "Date N/A"}{" "}
                    at{" "}
                    {appointment.Appointment_Time
                      ? new Date(
                          appointment.Appointment_Time
                        ).toLocaleTimeString()
                      : "Time N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {appointment.Status}
                  </p>
                </div>
                <button
                  onClick={() => handleCreateRecord(appointment)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Add Medical Record
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Medical Records */}
        <div className="bg-white dark:bg-gray-800 light-purple:bg-light-purple-50 light-purple:border-light-purple-200 rounded-lg border p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 light-purple:text-healthcare-800 mb-4">
            Medical Records History ({medicalRecords.length})
          </h4>
          {medicalRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No medical records created yet</p>
              <p className="text-sm text-gray-500">
                Medical records will appear here after you create them
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalRecords.map((record) => (
                <div
                  key={record.Record_id}
                  className="border rounded-lg p-4 hover:bg-gray-50 light-purple:hover:bg-light-purple-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h5 className="font-medium">
                          Patient ID: {record.Patient_id}
                        </h5>
                        <span className="text-sm text-gray-500">
                          {new Date(record.Visit_Date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">
                        <strong>Diagnosis:</strong> {record.Diagnosis}
                      </p>
                      <p className="text-sm">
                        <strong>Symptoms:</strong> {record.Symptoms}
                      </p>
                      <p className="text-sm">
                        <strong>Treatment:</strong> {record.Treatment_Plan}
                      </p>
                      {record.Notes && (
                        <p className="text-sm">
                          <strong>Notes:</strong> {record.Notes}
                        </p>
                      )}
                      {record.Follow_up_Required && (
                        <p className="text-sm text-blue-600">
                          <strong>Follow-up required:</strong>{" "}
                          {new Date(record.Follow_Up_Date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return renderAppointments();
      case "patients":
        return renderPatients();
      case "prescriptions":
        return renderPrescriptions();
      case "medical-records":
        return renderMedicalRecords();
      case "schedule":
        return renderSchedule();
      case "reports":
        return <div>Medical Reports</div>;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="relative min-h-screen bg-background light-purple:bg-healthcare-gradient light-purple:bg-gradient-to-br light-purple:from-gentle-lavender light-purple:to-soft-purple">
      {/* Floating feathers for light-purple theme */}
      <FloatingFeathers />

      <div className="relative z-10 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Doctor Dashboard</h2>
          <Link
            to="/doctor/slots"
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Clock className="h-4 w-4" /> Advanced Slot Management
          </Link>
        </div>
        <nav className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { id: "appointments", label: "Appointments", icon: Calendar },
            { id: "patients", label: "Patients", icon: Users },
            { id: "prescriptions", label: "Prescriptions", icon: Pill },
            { id: "medical-records", label: "Medical Records", icon: FileText },
            { id: "schedule", label: "Schedule", icon: Clock },
            { id: "reports", label: "Reports", icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all duration-200 font-medium ${
                  activeTab === tab.id
                    ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 shadow-md"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-8 w-8" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="relative z-10 mb-8">{renderContent()}</div>

      <CreatePrescriptionModal
        isOpen={isCreatePrescriptionOpen && resolvedDoctorId !== null}
        onClose={() => setIsCreatePrescriptionOpen(false)}
        Doctor_id={resolvedDoctorId || 0}
        onSuccess={() => {
          toast.success("Prescription created successfully!");
        }}
      />

      <MedicalRecordModal
        isOpen={isMedicalRecordModalOpen && resolvedDoctorId !== null}
        onClose={() => {
          setIsMedicalRecordModalOpen(false);
          setSelectedAppointmentForRecord(null);
        }}
        patientId={selectedAppointmentForRecord?.Patient_id || 0}
        doctorId={resolvedDoctorId || 0}
        appointmentId={selectedAppointmentForRecord?.Appointment_id}
        onSuccess={() => {
          // Refresh medical records
          recordsApi.findAll().then((records) => {
            const doctorRecords = records.filter(
              (record) => record.Doctor_id === resolvedDoctorId
            );
            setMedicalRecords(doctorRecords);
          });
          toast.success("Medical record created successfully!");
        }}
      />
    </div>
  );
};

export default DoctorDashboard;
