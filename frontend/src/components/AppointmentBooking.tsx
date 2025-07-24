import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doctorApi } from "@/api/doctors";
import { scheduleApi } from "@/api/schedules";
import { slotApi } from "@/api/appointmentSlots";
import { appointmentApi } from "@/api/appointments";
import { patientApi } from "@/api/patients";
import { toast } from "sonner";
import { format, parseISO, isAfter, addDays } from "date-fns";
import { CalendarIcon, Clock, User, CheckCircle } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form-label";

export enum AppointmentType {
  InPerson = "In-Person",
  TeleMedicine = "TeleMedicine",
  FollowUp = "Follow-Up",
}

export enum AppointmentStatus {
  Scheduled = "Scheduled",
  Confirmed = "Confirmed",
  InProgress = "In Progress",
  Completed = "Completed",
  Cancelled = "Cancelled",
  NoShow = "No Show",
}

export enum PaymentStatus {
  Pending = "Transaction Pending",
  Paid = "Paid",
}

interface Doctor {
  Doctor_id: string;
  User_id: number;
  License_number: string;
  Specialization: string;
  Department: string;
  Experience_Years: number;
  Rating: number;
  First_Name?: string;
  Last_Name?: string;
}

interface Schedule {
  Schedule_id: number;
  Doctor_id: number;
  Day_Of_The_Week: string;
  Start_Time: string;
  End_Time: string;
  Slot_Duration: number;
  Is_Active: boolean;
}

interface Slot {
  Slot_id: number;
  Doctor_id: number;
  Slot_Date: string;
  Slot_Time: string;
  Is_Available: boolean;
}

interface AppointmentFormData {
  Doctor_id: string;
  Patient_id: number;
  Appointment_Date: string;
  Appointment_Time: string;
  Appointment_Type: AppointmentType;
  Status: AppointmentStatus;
  Reason_For_Visit: string;
  Notes: string;
  Payment_Status: PaymentStatus;
}

export function AppointmentBooking() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<AppointmentFormData>({
    Doctor_id: "",
    Patient_id: 0, 
    Appointment_Date: "",
    Appointment_Time: "",
    Appointment_Type: AppointmentType.InPerson,
    Status: AppointmentStatus.Scheduled,
    Reason_For_Visit: "",
    Notes: "",
    Payment_Status: PaymentStatus.Pending,
  });

  //fetch all doctors.
  // useEffect(() => {
  //   const fetchDoctors = async () => {
  //     try {
  //       setLoading(true);
  //       const doctorData = await doctorApi.getAll();
  //       const filteredDoctors = doctorData
  //         .filter(doctor => doctor.Doctor_id !== undefined && doctor.Doctor_id !== null)
  //         .map(doctor => ({
  //           ...doctor,
  //           Doctor_id: String(doctor.Doctor_id)
  //         }));

  //       setDoctors(filteredDoctors);
  //       if (filteredDoctors.length === 0) {
  //         toast.info('No doctors found');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching doctors:', error);
  //       toast.error('Failed to load doctors');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDoctors();
  // }, []);

  useEffect(() => {
    const fetchDoctorsWithSlots = async () => {
      try {
        setLoading(true);
        const doctorData = await doctorApi.getAll();
        if (!Array.isArray(doctorData)) {
          console.error("Doctor data is not an array:", doctorData);
          throw new Error("Invalid doctor data format");
        }

        const slotsData = await slotApi.findAll();
        console.log("All slots from API:", slotsData);
        console.log("Doctor data from API:", doctorData);

        let availableSlots: Slot[] = [];
        if (Array.isArray(slotsData)) {
          availableSlots = slotsData
            .filter((slot) => slot.Is_Available)
            .map((slot) => ({
              ...slot,
              Slot_Date:
                typeof slot.Slot_Date === "string"
                  ? slot.Slot_Date
                  : slot.Slot_Date.toISOString().slice(0, 10),
              Slot_Time:
                typeof slot.Slot_Time === "string"
                  ? slot.Slot_Time
                  : slot.Slot_Time.toISOString().slice(11, 16),
            }));
        } else {
          console.error("Slots data is not an array:", slotsData);
          availableSlots = [];
        }
        console.log("Available slots:", availableSlots);

        const doctorsWithSlots = new Set(
          availableSlots.map((slot) => slot.Doctor_id)
        );
        console.log("Doctors with slots:", Array.from(doctorsWithSlots));
        const filteredDoctors = doctorData
          .filter(
            (doctor) =>
              doctor.Doctor_id !== undefined && doctor.Doctor_id !== null
          )
          .map((doctor) => ({
            ...doctor,
            Doctor_id: String(doctor.Doctor_id),
          }));

        setDoctors(filteredDoctors);
        if (filteredDoctors.length === 0) {
          toast.info("No doctors found");
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorsWithSlots();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedDoctor) return;

      try {
        setLoading(true);
        const scheduleData = await scheduleApi.findByDoctorId(
          parseInt(selectedDoctor)
        );
        setSchedules(scheduleData);
      } catch (error) {
        console.error("Error fetching doctor schedules:", error);
        toast.error("Failed to load doctor schedules");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [selectedDoctor]);

  const handleDoctorSelect = (Doctor_id: string) => {
    setSelectedDoctor(Doctor_id);
    setFormData((prev) => ({ ...prev, Doctor_id: Doctor_id }));
    setStep(2);
  };

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, Appointment_Date: date }));

    try {
      setLoading(true);

      // Log the doctor ID and date being used for debugging
      console.log(
        `Fetching slots for doctor ID: ${selectedDoctor} and date: ${date}`
      );

      // First try to get all slots to see what's available
      const allSlots = await slotApi.findAll();
      console.log("All available slots in system:", allSlots);

      // Filter slots manually for the selected doctor and date
      const doctorSlots = allSlots.filter(
        (slot) =>
          slot.Doctor_id === parseInt(selectedDoctor) &&
          slot.Slot_Date.toString().includes(date)
      );
      console.log("Filtered slots for doctor and date:", doctorSlots);

      // Now try the API endpoint
      const slotsData = await slotApi.findByDoctorAndDate(
        parseInt(selectedDoctor),
        date
      );
      console.log("Slots from API endpoint:", slotsData);

      // Use whichever has more results
      const bestSlotData =
        doctorSlots.length > slotsData.length ? doctorSlots : slotsData;

      const filteredSlots = bestSlotData.filter((slot) => slot.Is_Available);
      console.log("Available filtered slots:", filteredSlots);

      setAvailableSlots(
        (filteredSlots || []).map((slot) => ({
          ...slot,
          Slot_Date:
            typeof slot.Slot_Date === "string"
              ? slot.Slot_Date
              : slot.Slot_Date.toISOString().slice(0, 10),
          Slot_Time:
            typeof slot.Slot_Time === "string"
              ? slot.Slot_Time
              : slot.Slot_Time.toISOString().slice(11, 16),
        }))
      );

      if (filteredSlots.length > 0) {
        const firstSlot = filteredSlots[0];
        setSelectedTime(
          typeof firstSlot.Slot_Time === "string"
            ? firstSlot.Slot_Time
            : firstSlot.Slot_Time.toISOString().slice(11, 16)
        );
        setSelectedSlot({
          ...firstSlot,
          Slot_Date:
            typeof firstSlot.Slot_Date === "string"
              ? firstSlot.Slot_Date
              : firstSlot.Slot_Date.toISOString().slice(0, 10),
          Slot_Time:
            typeof firstSlot.Slot_Time === "string"
              ? firstSlot.Slot_Time
              : firstSlot.Slot_Time.toISOString().slice(11, 16),
        });
        setFormData((prev) => ({
          ...prev,
          Appointment_Date: date,
          Appointment_Time:
            typeof firstSlot.Slot_Time === "string"
              ? firstSlot.Slot_Time
              : firstSlot.Slot_Time.toISOString().slice(11, 16),
        }));
        toast.success(`Found ${filteredSlots.length} available slots`);
        setStep(4);
      } else {
        toast.error("No available slots for this date");
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Failed to load available time slots");
    } finally {
      setLoading(false);
    }
  };

  // const handleTimeSelect = (slot: Slot) => {
  //   setSelectedTime(slot.Slot_Time);
  //   setSelectedSlot(slot);
  //   setFormData(prev => ({
  //     ...prev,
  //     Appointment_Time: slot.Slot_Time
  //   }));
  // };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.User_id) {
      toast.error("You must be logged in to book an appointment");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select a valid appointment slot");
      return;
    }
    try {
      setLoading(true);

      const Doctor_id = parseInt(formData.Doctor_id);
      if (isNaN(Doctor_id)) {
        throw new Error(`Invalid Doctor ID: ${formData.Doctor_id}`);
      }

      console.log("Doctor ID being used for appointment:", Doctor_id);

      // First, get the patient record to get the Patient_id
      const patientRecord = await patientApi.getByUserId(user.User_id);
      if (!patientRecord || !patientRecord.Patient_id) {
        throw new Error(
          "Patient record not found. Please complete your patient profile first."
        );
      }

      const appointmentData = {
        Patient_id: patientRecord.Patient_id,
        Doctor_id: Doctor_id,
        Appointment_Date: formData.Appointment_Date,
        Appointment_Time: formData.Appointment_Time,
        Appointment_Type: formData.Appointment_Type,
        Status: AppointmentStatus.Scheduled,
        Reason_For_Visit: formData.Reason_For_Visit || "General checkup",
        Notes: formData.Notes || "No additional notes",
        Payment_Status: PaymentStatus.Pending,
      };

      console.log("Sending appointment data:", appointmentData);

      const response = await appointmentApi.register(appointmentData);
      console.log("Appointment created:", response);

      // await slotApi.update(selectedSlot.Slot_id, { Is_Available: false });

      toast.success("Appointment booked successfully!");
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(
        "Failed to book appointment: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      Doctor_id: "",
      Patient_id: 0, // Will be set when patient record is fetched
      Appointment_Date: "",
      Appointment_Time: "",
      Appointment_Type: AppointmentType.InPerson,
      Status: AppointmentStatus.Scheduled,
      Reason_For_Visit: "",
      Notes: "",
      Payment_Status: PaymentStatus.Pending,
    });
    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedSlot(null);
    setStep(1);
    setAvailableSlots([]);
  };

  const doctorsBySpecialization = doctors.reduce((acc, doctor) => {
    const spec = doctor.Specialization || "Other";
    if (!acc[spec]) {
      acc[spec] = [];
    }
    acc[spec].push(doctor);
    return acc;
  }, {} as Record<string, Doctor[]>);

  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE, MMM d"),
    };
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Book Appointment
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full md:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Book an Appointment</SheetTitle>
          <SheetDescription>
            Complete the steps below to schedule your appointment.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <div
                className={`flex items-center ${
                  step >= 1 ? "text-purple-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step >= 1
                      ? "bg-purple-100 text-purple-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <User size={16} />
                </div>
                <span>Doctor</span>
              </div>
              <div
                className={`flex items-center ${
                  step >= 2 ? "text-purple-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step >= 2
                      ? "bg-purple-100 text-purple-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <CalendarIcon size={16} />
                </div>
                <span>Date</span>
              </div>
              <div
                className={`flex items-center ${
                  step >= 4 ? "text-purple-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step >= 4
                      ? "bg-purple-100 text-purple-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <CheckCircle size={16} />
                </div>
                <span>Details</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${step === 1 ? 33 : step === 2 ? 66 : 100}%` }}
              ></div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select a Doctor</h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading doctors...</p>
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">
                    No doctors with available slots found.
                  </p>
                  <p className="mt-2 text-amber-700">Please try again later.</p>
                </div>
              ) : (
                <>
                  <Tabs
                    defaultValue={
                      Object.keys(doctorsBySpecialization)[0] || "all"
                    }
                  >
                    <TabsList className="mb-4 flex flex-wrap">
                      {Object.keys(doctorsBySpecialization).map((spec) => (
                        <TabsTrigger
                          key={spec}
                          value={spec}
                          className="flex-grow"
                        >
                          {spec}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {Object.entries(doctorsBySpecialization).map(
                      ([spec, doctorList]) => (
                        <TabsContent
                          key={spec}
                          value={spec}
                          className="space-y-4"
                        >
                          {doctorList.map((doctor) => (
                            <div
                              key={doctor.Doctor_id}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedDoctor === doctor.Doctor_id
                                  ? "border-purple-500 bg-purple-50"
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() =>
                                handleDoctorSelect(doctor.Doctor_id)
                              }
                            >
                              <div className="flex justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    Dr. {doctor.First_Name || ""}{" "}
                                    {doctor.Last_Name || doctor.License_number}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {doctor.Specialization}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {doctor.Department}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm">
                                    {doctor.Experience_Years} years exp.
                                  </p>
                                  <p className="text-sm text-yellow-600">
                                    ★ {doctor.Rating || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      )
                    )}
                  </Tabs>
                  <div className="pt-4 flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!selectedDoctor}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Select Date
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select a Date</h3>

              <div className="grid grid-cols-2 gap-2">
                {availableDates.map((date) => (
                  <div
                    key={date.value}
                    className={`p-4 border rounded-lg cursor-pointer text-center transition-colors ${
                      selectedDate === date.value
                        ? "border-purple-500 bg-purple-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleDateSelect(date.value)}
                  >
                    <p className="font-medium">{date.label}</p>
                  </div>
                ))}
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    Checking available slots...
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!selectedDate || loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Next: Details
                </Button>
              </div>
            </div>
          )}

          {/* Time selection step removed */}

          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-medium">Appointment Details</h3>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Selected Appointment
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Date:</p>
                    <p className="font-medium">
                      {selectedDate
                        ? new Date(selectedDate).toLocaleDateString()
                        : "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Time:</p>
                    <p className="font-medium">
                      {selectedTime
                        ? selectedTime.substring(0, 5)
                        : "Not selected"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="appointmentType">
                  Appointment Type
                </FormLabel>
                <select
                  id="appointmentType"
                  name="Appointment_Type"
                  value={formData.Appointment_Type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {Object.values(AppointmentType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="reasonForVisit">Reason for Visit</FormLabel>
                <textarea
                  id="reasonForVisit"
                  name="Reason_For_Visit"
                  value={formData.Reason_For_Visit}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="notes">
                  Additional Notes (Optional)
                </FormLabel>
                <textarea
                  id="notes"
                  name="Notes"
                  value={formData.Notes}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? "Booking..." : "Book Appointment"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
