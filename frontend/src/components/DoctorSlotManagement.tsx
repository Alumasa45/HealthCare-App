import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { slotApi } from "@/api/appointmentSlots";
import { scheduleApi } from "@/api/schedules";
import { appointmentApi } from "@/api/appointments";
import { doctorApi } from "@/api/doctors";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  User as UserIcon,
  Clock,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormLabel } from "@/components/ui/form-label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

enum DayOfWeek {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

interface SlotFormData {
  date: Date | undefined;
  time: string;
}

interface ScheduleFormData {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

interface Schedule {
  Schedule_id: number;
  Doctor_id: number;
  Day_Of_The_Week: DayOfWeek;
  Start_Time: string;
  End_Time: string;
  Slot_Duration: number;
  Is_Active: boolean;
  Created_at: string;
  Updated_at: string;
}

interface Appointment {
  Appointment_id: number;
  Patient_id?: number;
  Doctor_id?: number;
  Appointment_Date: Date | string;
  Appointment_Time: Date | string;
  Appointment_Type: "In-Person" | "TeleMedicine" | "Follow-up";
  Status:
    | "Scheduled"
    | "Confirmed"
    | "In Progress"
    | "Completed"
    | "Cancelled"
    | "No Show";
  Reason_For_Visit: string;
  Notes: string;
  Payment_Status: "Transaction pending" | "Paid";
  Created_at: Date | string;
  Updated_at: Date | string;
  Patient_Name?: string;
  Patient_Email?: string;
  Patient_Phone?: string;
}


interface Doctor {
  Doctor_id: number;
  First_Name?: string;
  Last_Name?: string;
  License_number?: string;
  Specialization?: string;
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
  specialization?: string;
}

export function DoctorSlotManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<string>("slots");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  console.log("DoctorSlotManagement - Current user:", user);
  console.log("DoctorSlotManagement - User type:", user?.User_Type);
  console.log("DoctorSlotManagement - Doctor ID:", user?.Doctor_id);
  console.log("DoctorSlotManagement - User ID:", user?.User_id);
  const [slotForm, setSlotForm] = useState<SlotFormData>({
    date: undefined,
    time: "09:00",
  });
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    dayOfWeek: DayOfWeek.Monday,
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
    isActive: true,
  });
  const [generatingSlots, setGeneratingSlots] = useState(false);
  const [slotGenerationForm, setSlotGenerationForm] = useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
  });

  useEffect(() => {
    fetchAllDoctors();
    const defaultDoctorId = 1; 
    setSelectedDoctorId(defaultDoctorId);

    if (user && user.User_Type === "Doctor") {
      const doctorId = getDoctorId() || defaultDoctorId;
      if (doctorId) {
        setSelectedDoctorId(doctorId);
      }
    }
    fetchDoctorSlots();
    fetchDoctorSchedules();
    fetchDoctorAppointments();
  }, [user]);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchDoctorSlots();
      fetchDoctorSchedules();
      fetchDoctorAppointments();
    }
  }, [selectedDoctorId]);

  const fetchAllDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorApi.getAll();
      setDoctors(
        response.map((doctor: any) => ({
          Doctor_id: doctor.Doctor_id || 0,
          First_Name: doctor.First_Name || doctor.firstName || '',
          Last_Name: doctor.Last_Name || doctor.lastName || '',
          License_number: doctor.License_number || doctor.licenseNumber || '',
          Specialization: doctor.Specialization || doctor.specialization || ''
        }))
      );
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const getDoctorId = () => {
    if (selectedDoctorId !== null) {
      return selectedDoctorId;
    }

    try {
      const currentDoctorStr = localStorage.getItem("currentDoctor");
      if (currentDoctorStr) {
        const currentDoctor = JSON.parse(currentDoctorStr);
        if (currentDoctor && currentDoctor.Doctor_id) {
          console.log(
            "Using Doctor_id from localStorage:",
            currentDoctor.Doctor_id
          );
          return currentDoctor.Doctor_id;
        }
      }
    } catch (e) {
      console.error("Error parsing currentDoctor from localStorage:", e);
    }

    // Then check user context
    const Doctor_id = user?.Doctor_id;
    console.log("getDoctorId - Doctor_id from user context:", Doctor_id);

    if (Doctor_id != null && String(Doctor_id) !== "unknown") {
      const numericId =
        typeof Doctor_id === "string" ? parseInt(Doctor_id) : Doctor_id;
      return isNaN(numericId) ? null : numericId;
    }

    // Last resort: check userData in localStorage
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData && userData.Doctor_id) {
          console.log(
            "Using Doctor_id from userData in localStorage:",
            userData.Doctor_id
          );
          return userData.Doctor_id;
        }
      }
    } catch (e) {
      console.error("Error parsing userData from localStorage:", e);
    }

    // Absolute fallback for development only
    console.warn("Using default Doctor ID 1 as fallback");
    return 1; // Always return a valid ID for testing
  };

  const fetchDoctorSlots = async () => {
    const Doctor_id = getDoctorId();
    console.log("fetchDoctorSlots - Doctor ID:", Doctor_id);
    if (!Doctor_id) {
      console.error("No doctor ID available");
      return;
    }

    try {
      setLoading(true);
      const response = await slotApi.findAll();
      console.log("fetchDoctorSlots - All slots response:", response);
      const doctorSlots = response.filter((slot) => {
        console.log(
          "Comparing slot.Doctor_id:",
          slot.Doctor_id,
          "with Doctor_id:",
          Doctor_id
        );
        return slot.Doctor_id === Doctor_id;
      });
      console.log("fetchDoctorSlots - Filtered doctor slots:", doctorSlots);
      setSlots(doctorSlots);
    } catch (error) {
      console.error("Error fetching doctor slots:", error);
      toast.error("Failed to load your appointment slots");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorSchedules = async () => {
    const Doctor_id = getDoctorId();
    if (!Doctor_id) {
      console.error("No doctor ID available for schedules");
      return;
    }

    try {
      setLoading(true);
      const response = await scheduleApi.findByDoctorId(Doctor_id);
      setSchedules(
        response.map((schedule: any) => ({
          ...schedule,
          Day_Of_The_Week: schedule.Day_Of_The_Week as DayOfWeek,
        }))
      );
    } catch (error) {
      console.error("Error fetching doctor schedules:", error);
      toast.error("Failed to load your schedules");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorAppointments = async () => {
    const Doctor_id = getDoctorId();
    console.log("fetchDoctorAppointments - Doctor ID:", Doctor_id);
    if (!Doctor_id) {
      console.error("No doctor ID available for appointments");
      return;
    }

    try {
      setLoading(true);
      const response = await appointmentApi.getAll();
      console.log(
        "fetchDoctorAppointments - All appointments response:",
        response
      );
      const doctorAppointments = response.filter((appointment) => {
        console.log(
          "Comparing appointment.Doctor_id:",
          appointment.Doctor_id,
          "with Doctor_id:",
          Doctor_id
        );
        return appointment.Doctor_id === Doctor_id;
      });
      console.log(
        "fetchDoctorAppointments - Filtered doctor appointments:",
        doctorAppointments
      );
      setAppointments(doctorAppointments);
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      toast.error("Failed to load your appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    // Use the selected doctor ID or fall back to a default
    const Doctor_id = getDoctorId() || selectedDoctorId || 1;
    console.log("Using Doctor_id for adding slot:", Doctor_id);

    if (!slotForm.date) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      setLoading(true);
      const formattedDate = slotForm.date.toISOString().split("T")[0];

      const newSlot = {
        Doctor_id: Doctor_id,
        Slot_Date: formattedDate,
        Slot_Time: slotForm.time,
        Is_Available: true,
        Is_Blocked: false,
      } as any;

      await slotApi.create(newSlot);
      toast.success("Appointment slot added successfully");
      fetchDoctorSlots();
      setSlotForm({
        date: undefined,
        time: "09:00",
      });
    } catch (error) {
      console.error("Error adding slot:", error);
      toast.error("Failed to add appointment slot");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (Slot_id: number) => {
    try {
      setLoading(true);
      await slotApi.delete(Slot_id.toString());
      toast.success("Slot deleted successfully");
      fetchDoctorSlots();
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Failed to delete slot");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    // Use the selected doctor ID or fall back to a default
    const Doctor_id = getDoctorId() || selectedDoctorId || 1;
    console.log("Using Doctor_id for schedule:", Doctor_id);

    if (!Doctor_id) {
      toast.error("Please select a doctor");
      return;
    }

    try {
      setLoading(true);
      const newSchedule = {
        Doctor_id: Doctor_id,
        Day_Of_The_Week: scheduleForm.dayOfWeek,
        Start_Time: scheduleForm.startTime,
        End_Time: scheduleForm.endTime,
        Slot_Duration: scheduleForm.slotDuration,
        Is_Active: scheduleForm.isActive,
      };

      console.log("Adding schedule for doctor:", Doctor_id, newSchedule);
      await scheduleApi.create(newSchedule);
      toast.success("Schedule added successfully");
      fetchDoctorSchedules();

      // Reset form
      setScheduleForm({
        dayOfWeek: DayOfWeek.Monday,
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
        isActive: true,
      });
    } catch (error) {
      console.error("Error adding schedule:", error);
      toast.error(
        "Failed to add schedule: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      setLoading(true);
      await scheduleApi.delete(scheduleId);
      toast.success("Schedule deleted successfully");
      fetchDoctorSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlots = async () => {
    // Use the selected doctor ID or fall back to a default
    const Doctor_id = getDoctorId() || selectedDoctorId || 1;
    console.log("Using Doctor_id for generating slots:", Doctor_id);

    if (!Doctor_id) {
      toast.error("Please select a doctor");
      return;
    }

    try {
      setGeneratingSlots(true);
      const startDate = format(slotGenerationForm.startDate, "yyyy-MM-dd");
      const endDate = format(slotGenerationForm.endDate, "yyyy-MM-dd");

      console.log("Generating slots for doctor:", Doctor_id, {
        startDate,
        endDate,
      });
      const response = await scheduleApi.generateSlots({
        doctorId: Doctor_id,
        startDate,
        endDate,
      });

      toast.success(`${response.slotsGenerated} slots generated successfully`);
      fetchDoctorSlots();
    } catch (error) {
      console.error("Error generating slots:", error);
      toast.error(
        "Failed to generate appointment slots: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setGeneratingSlots(false);
    }
  };

  const handleUpdateAppointmentStatus = async (
    appointmentId: number,
    newStatus: string
  ) => {
    try {
      setLoading(true);
      await appointmentApi.update(appointmentId, { Status: newStatus } as any);
      toast.success(`Appointment status updated to ${newStatus}`);
      fetchDoctorAppointments();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("Failed to update appointment status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-4 bg-gray-100 border rounded">
          <p>
            <strong>Debug Info:</strong>
          </p>
          <p>User Type: {user?.User_Type}</p>
          <p>User ID: {user?.User_id}</p>
          <p>Doctor ID: {user?.Doctor_id}</p>
          <p>Selected Doctor ID: {selectedDoctorId}</p>
          <p>Effective Doctor ID: {getDoctorId()}</p>
        </div>
      )}

      {/* Doctor Selection Dropdown */}
      <div className="mb-6">
        <label htmlFor="doctor-select" className="mb-2 block font-medium text-sm">
          Select Doctor
        </label>
        <select
          id="doctor-select"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedDoctorId?.toString() || ""}
          onChange={(e) => setSelectedDoctorId(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Select a doctor</option>
          {doctors.map((doctor: Doctor) => (
            <option key={doctor.Doctor_id} value={doctor.Doctor_id.toString()}>
              Dr. {doctor.First_Name} {doctor.Last_Name} ({doctor.Specialization || doctor.License_number})
            </option>
          ))}
        </select>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Manage Your Appointments</CardTitle>
          <CardDescription>
            Set your schedule and manage appointment slots for patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tab Navigation */}
            <TabsList className="mb-4">
              <TabsTrigger value="slots">Individual Slots</TabsTrigger>
              <TabsTrigger value="schedules">Weekly Schedule</TabsTrigger>
              <TabsTrigger value="appointments">My Appointments</TabsTrigger>
              <TabsTrigger value="generate">Generate Slots</TabsTrigger>
            </TabsList>

            {/* Individual Slots Tab */}
            <TabsContent value="slots">
              {/* ...existing slots tab content... */}
              {activeTab === "slots" && (
                <div className="mb-6">
                  {/* ...existing slots tab JSX... */}
                </div>
              )}
            </TabsContent>

            {/* Weekly Schedule Tab */}
            <TabsContent value="schedules">
              {/* ...existing schedules tab content... */}
              {activeTab === "schedules" && (
                <>
                  <div className="mb-6">
                    {/* ...existing schedules form JSX... */}
                  </div>
                  <div className="mt-6">
                    {/* ...existing schedules list JSX... */}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments">
              {/* ...existing appointments tab content... */}
              {activeTab === "appointments" && (
                <div className="mb-6">
                  {/* ...existing appointments tab JSX... */}
                </div>
              )}
            </TabsContent>

            {/* Generate Slots Tab */}
            <TabsContent value="generate">
              {/* ...existing generate slots tab content... */}
              {activeTab === "generate" && (
                <div className="space-y-6">
                  {/* ...existing generate slots tab JSX... */}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

            <TabsContent value="appointments">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Your Appointments</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">
                      Loading appointments...
                    </p>
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.Appointment_id}
                        className="p-4 border rounded-lg bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  {appointment.Patient_Name ||
                                    `Patient ID: ${appointment.Patient_id}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {new Date(
                                    appointment.Appointment_Date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {appointment.Appointment_Time
                                    ? typeof appointment.Appointment_Time ===
                                      "string"
                                      ? appointment.Appointment_Time.substring(
                                          0,
                                          5
                                        )
                                      : new Date(
                                          appointment.Appointment_Time
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {appointment.Appointment_Type}
                                </span>
                              </div>
                            </div>

                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">
                                Reason for Visit:
                              </p>
                              <p className="text-sm text-gray-600">
                                {appointment.Reason_For_Visit}
                              </p>
                            </div>

                            {appointment.Notes && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700">
                                  Notes:
                                </p>
                                <p className="text-sm text-gray-600">
                                  {appointment.Notes}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-4">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  appointment.Status === "Scheduled"
                                    ? "bg-blue-100 text-blue-800"
                                    : appointment.Status === "Confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : appointment.Status === "Completed"
                                    ? "bg-gray-100 text-gray-800"
                                    : appointment.Status === "Cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {appointment.Status}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  appointment.Payment_Status === "Paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                {appointment.Payment_Status}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {/* View Patient Details Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              View Patient
                            </Button>

                            {/* Status-specific action buttons */}
                            {appointment.Status === "Scheduled" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(
                                      appointment.Appointment_id,
                                      "Confirmed"
                                    )
                                  }
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(
                                      appointment.Appointment_id,
                                      "Cancelled"
                                    )
                                  }
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {appointment.Status === "Confirmed" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(
                                      appointment.Appointment_id,
                                      "In Progress"
                                    )
                                  }
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Start
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateAppointmentStatus(
                                      appointment.Appointment_id,
                                      "Cancelled"
                                    )
                                  }
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {appointment.Status === "In Progress" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateAppointmentStatus(
                                    appointment.Appointment_id,
                                    "Completed"
                                  )
                                }
                                className="bg-gray-600 hover:bg-gray-700"
                              >
                                Complete
                              </Button>
                            )}

                            {/* Reschedule button for non-completed appointments */}
                            {appointment.Status !== "Completed" &&
                              appointment.Status !== "Cancelled" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                  Reschedule
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    <p>No appointments found.</p>
                    <p className="mt-2">
                      Appointments will appear here when patients book with you.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="generate">
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                  <p className="text-amber-800 text-sm">
                    Generate appointment slots based on your weekly schedule.
                    This will create available slots for the date range you
                    select.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormLabel className="mb-2 block">Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {slotGenerationForm.startDate ? (
                            format(slotGenerationForm.startDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={slotGenerationForm.startDate}
                          onSelect={(date) =>
                            date &&
                            setSlotGenerationForm((prev) => ({
                              ...prev,
                              startDate: date,
                            }))
                          }
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <FormLabel className="mb-2 block">End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {slotGenerationForm.endDate ? (
                            format(slotGenerationForm.endDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={slotGenerationForm.endDate}
                          onSelect={(date) =>
                            date &&
                            setSlotGenerationForm((prev) => ({
                              ...prev,
                              endDate: date,
                            }))
                          }
                          disabled={(date) =>
                            date < slotGenerationForm.startDate
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateSlots}
                  disabled={generatingSlots || schedules.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {generatingSlots ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>Generate Appointment Slots</>
                  )}
                </Button>

                {schedules.length === 0 && (
                  <div className="text-center py-4 text-amber-600">
                    <p>
                      Please add at least one weekly schedule before generating
                      slots.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Card>
      </div>
  );
}
