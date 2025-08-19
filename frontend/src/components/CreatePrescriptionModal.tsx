import React, { useState, useEffect } from "react";
import { X, Plus, UserCheck, Calendar, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appointmentApi } from "@/api/appointments";
import { patientApi } from "@/api/patients";
import { prescriptionapi } from "@/api/prescriptions";
import { PharmacySelectionModal } from "@/components/modals/PharmacySelectionModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Appointment } from "@/api/interfaces/appointment";
import type { Prescription } from "@/api/interfaces/prescription";

interface Patient {
  Patient_id: number;
  User_id: number;
  user?: {
    First_Name: string;
    Last_Name: string;
    Email: string;
  };
}

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

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  Doctor_id: number;
  onSuccess?: () => void;
}

export const CreatePrescriptionModal: React.FC<
  CreatePrescriptionModalProps
> = ({ isOpen, onClose, Doctor_id, onSuccess }) => {
  const { isAuthenticated, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
  const [createdPrescription, setCreatedPrescription] = useState<{
    prescriptionId: number;
    patientName: string;
    medicineName: string;
    totalAmount: number;
    patientId: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    Patient_id: "",
    Appointment_id: "",
    Medicine_Name: "",
    Prescription_Number: "",
    Issue_Date: new Date().toISOString().split("T")[0],
    Validity_Period: "",
    Total_Amount: "",
    Notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      fetchAppointments();
      generatePrescriptionNumber();
    }
  }, [isOpen, Doctor_id]);

  const fetchPatients = async () => {
    try {
      if (!isAuthenticated) {
        toast.error("Authentication required. Please log in again.");
        onClose();
        return;
      }

      if (!Doctor_id || Doctor_id <= 0) {
        console.error("Invalid Doctor_id:", Doctor_id);
        toast.error("Invalid doctor ID. Please contact support.");
        return;
      }

      console.log(`Fetching patients for doctor ${Doctor_id}`);

      // First, try to get patients who have appointments with this doctor
      const appointmentData = (await appointmentApi.getByDoctorId(
        Doctor_id
      )) as ExtendedAppointment[];

      console.log("Appointment data:", appointmentData);

      const uniquePatients = new Map();
      appointmentData.forEach((appointment) => {
        if (
          appointment.patient &&
          !uniquePatients.has(appointment.Patient_id)
        ) {
          uniquePatients.set(appointment.Patient_id, {
            Patient_id: appointment.Patient_id,
            User_id: appointment.patient.User_id,
            user: appointment.patient.user,
          });
        }
      });

      let patientsArray = Array.from(uniquePatients.values());

      // If no patients found through appointments, get all patients as fallback
      if (patientsArray.length === 0) {
        console.log(
          "No patients found through appointments, fetching all patients as fallback"
        );
        try {
          const allPatients = await patientApi.getAll();
          console.log("All patients:", allPatients);

          // Transform the data to match our interface
          patientsArray = allPatients
            .map((patient: any) => ({
              Patient_id: patient.Patient_id,
              User_id: patient.User_id,
              user: patient.user, // This should contain First_Name, Last_Name, Email
            }))
            .filter((patient) => patient.user); // Only include patients with user data
        } catch (error) {
          console.warn("Failed to fetch all patients as fallback:", error);
        }
      }

      setPatients(patientsArray);
      console.log(
        `Found ${patientsArray.length} patients for doctor ${Doctor_id}`
      );
    } catch (error) {
      console.error("Error fetching patients:", error);

      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes("401")) {
        toast.error("Session expired. Please log in again.");
        logout();
        onClose();
        return;
      }

      toast.error("Failed to load patients who have appointments with you");
    }
  };

  const fetchAppointments = async () => {
    try {
      if (!isAuthenticated) {
        toast.error("Authentication required. Please log in again.");
        onClose();
        return;
      }

      if (!Doctor_id || Doctor_id <= 0) {
        console.error("Invalid Doctor_id for fetchAppointments:", Doctor_id);
        return;
      }

      const data = (await appointmentApi.getByDoctorId(
        Doctor_id
      )) as ExtendedAppointment[];
      const relevantAppointments = data.filter(
        (apt) =>
          apt.Status === "Completed" ||
          apt.Status === "Confirmed" ||
          apt.Status === "In Progress"
      );
      setAppointments(relevantAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);

      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes("401")) {
        toast.error("Session expired. Please log in again.");
        logout();
        onClose();
        return;
      }

      toast.error("Failed to load appointments");
    }
  };

  const generatePrescriptionNumber = () => {
    const timestamp = Date.now();
    const prescriptionNumber = `RX-${timestamp}`;
    setFormData((prev) => ({
      ...prev,
      Prescription_Number: prescriptionNumber,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Authentication required. Please log in again.");
      logout();
      onClose();
      return;
    }

    if (
      !formData.Patient_id ||
      !formData.Medicine_Name ||
      !formData.Total_Amount
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      // Validate Patient_id
      const patientId = parseInt(formData.Patient_id);
      if (isNaN(patientId) || patientId <= 0) {
        toast.error("Please select a valid patient");
        return;
      }

      // Validate Doctor_id
      if (!Doctor_id || Doctor_id <= 0) {
        toast.error("Invalid doctor ID. Please contact support.");
        return;
      }

      // Verify the patient exists in our data
      const selectedPatient = patients.find((p) => p.Patient_id === patientId);
      if (!selectedPatient) {
        toast.error(
          "Selected patient not found. Please refresh and try again."
        );
        return;
      }

      // Handle Appointment_id properly (undefined if not selected, as backend might expect)
      const appointmentId =
        formData.Appointment_id && formData.Appointment_id !== ""
          ? parseInt(formData.Appointment_id)
          : undefined;

      const prescriptionData: Omit<
        Prescription,
        "Prescription_id" | "Created_at" | "Updated_at" | "doctor" | "patient"
      > = {
        Patient_id: patientId,
        Doctor_id: Doctor_id,
        Appointment_id: appointmentId,
        Medicine_Name: formData.Medicine_Name.trim(),
        Prescription_Number: formData.Prescription_Number.trim(),
        Issue_Date: new Date(formData.Issue_Date),
        Validity_Period: new Date(formData.Validity_Period),
        Total_Amount: parseFloat(formData.Total_Amount),
        Status: "Active" as const,
        Notes: formData.Notes.trim(),
      };

      console.log("🔍 Prescription data being sent:", prescriptionData);
      console.log("🔍 Doctor_id:", Doctor_id);
      console.log("🔍 Patient_id (original):", formData.Patient_id);
      console.log("🔍 Patient_id (parsed):", patientId);
      console.log("🔍 Appointment_id:", appointmentId);
      console.log("🔍 Selected patient:", selectedPatient);

      const createdPrescription = await prescriptionapi.create(
        prescriptionData
      );

      toast.success("Prescription created successfully!");

      // Store prescription details for pharmacy modal
      setCreatedPrescription({
        prescriptionId:
          createdPrescription.Prescription_id || createdPrescription.id,
        patientName: `${selectedPatient?.user?.First_Name || "Unknown"} ${
          selectedPatient?.user?.Last_Name || "Patient"
        }`,
        medicineName: formData.Medicine_Name.trim(),
        totalAmount: parseFloat(formData.Total_Amount),
        patientId: patientId,
      });

      // Open pharmacy selection modal
      setIsPharmacyModalOpen(true);

      setFormData({
        Patient_id: "",
        Appointment_id: "",
        Medicine_Name: "",
        Prescription_Number: "",
        Issue_Date: new Date().toISOString().split("T")[0],
        Validity_Period: "",
        Total_Amount: "",
        Notes: "",
      });
    } catch (error) {
      console.error("Error creating prescription:", error);

      // Check if it's an authentication error
      if (error instanceof Error && error.message.includes("401")) {
        toast.error("Session expired. Please log in again.");
        logout();
        onClose();
        return;
      }

      toast.error("Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  const getPatientAppointments = () => {
    if (!formData.Patient_id) return [];
    return appointments.filter(
      (apt) => apt.Patient_id === parseInt(formData.Patient_id)
    );
  };

  if (!isOpen) return null;

  // Check authentication status
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please log in to continue creating prescriptions.
            </p>
            <Button
              onClick={() => {
                logout();
                onClose();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Pill className="h-5 w-5 text-purple-600" />
                Create New Prescription
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Select from patients who have appointments with you
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-160px)] bg-white dark:bg-gray-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="patient"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Patient *
                </Label>
                <Select
                  value={formData.Patient_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      Patient_id: value,
                      Appointment_id: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        patients.length === 0
                          ? "No patients with appointments found"
                          : "Select a patient"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.length === 0 ? (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        <UserCheck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No patients found</p>
                        <p className="text-xs">
                          Patients will appear here after they book appointments
                          with you
                        </p>
                      </div>
                    ) : (
                      patients.map((patient) => (
                        <SelectItem
                          key={patient.Patient_id}
                          value={patient.Patient_id.toString()}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            {patient.user
                              ? `${patient.user.First_Name} ${patient.user.Last_Name} (${patient.user.Email})`
                              : `Patient #${patient.Patient_id}`}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {patients.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Only patients who have appointments with you will appear in
                    this list
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="appointment"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Related Appointment (Optional)
                </Label>
                <Select
                  value={formData.Appointment_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, Appointment_id: value }))
                  }
                  disabled={!formData.Patient_id}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !formData.Patient_id
                          ? "Select a patient first"
                          : getPatientAppointments().length === 0
                          ? "No appointments found for this patient"
                          : "Select appointment"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getPatientAppointments().length === 0 ? (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No appointments found</p>
                      </div>
                    ) : (
                      getPatientAppointments().map((appointment) => (
                        <SelectItem
                          key={appointment.Appointment_id}
                          value={appointment.Appointment_id.toString()}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">
                                {new Date(
                                  appointment.Appointment_Date
                                ).toLocaleDateString()}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  appointment.Status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : appointment.Status === "Confirmed"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {appointment.Status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 ml-6">
                              {appointment.Reason_For_Visit}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="medicine"
                className="text-gray-700 dark:text-gray-300"
              >
                Medicine Name *
              </Label>
              <Input
                id="medicine"
                value={formData.Medicine_Name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    Medicine_Name: e.target.value,
                  }))
                }
                placeholder="Enter medicine name and dosage"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="prescriptionNumber"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Prescription Number
                </Label>
                <Input
                  id="prescriptionNumber"
                  value={formData.Prescription_Number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      Prescription_Number: e.target.value,
                    }))
                  }
                  placeholder="Auto-generated"
                  readOnly
                  className="bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="amount"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Total Amount ($) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.Total_Amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      Total_Amount: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="issueDate"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Issue Date
                </Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.Issue_Date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      Issue_Date: e.target.value,
                    }))
                  }
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="validityPeriod"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Valid Until *
                </Label>
                <Input
                  id="validityPeriod"
                  type="date"
                  value={formData.Validity_Period}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      Validity_Period: e.target.value,
                    }))
                  }
                  min={formData.Issue_Date}
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-gray-700 dark:text-gray-300"
              >
                Instructions/Notes
              </Label>
              <textarea
                id="notes"
                value={formData.Notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({ ...prev, Notes: e.target.value }))
                }
                placeholder="Enter dosage instructions, warnings, or additional notes..."
                rows={3}
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Prescription Summary:
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>
                  <span className="font-medium">Patient:</span>{" "}
                  {formData.Patient_id
                    ? patients.find(
                        (p) => p.Patient_id.toString() === formData.Patient_id
                      )?.user
                      ? `${
                          patients.find(
                            (p) =>
                              p.Patient_id.toString() === formData.Patient_id
                          )?.user?.First_Name
                        } ${
                          patients.find(
                            (p) =>
                              p.Patient_id.toString() === formData.Patient_id
                          )?.user?.Last_Name
                        }`
                      : `Patient #${formData.Patient_id}`
                    : "Not selected"}
                </p>
                <p>
                  <span className="font-medium">Medicine:</span>{" "}
                  {formData.Medicine_Name || "Not specified"}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> $
                  {formData.Total_Amount || "0.00"}
                </p>
                <p>
                  <span className="font-medium">Valid Until:</span>{" "}
                  {formData.Validity_Period
                    ? new Date(formData.Validity_Period).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Prescription
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Pharmacy Selection Modal */}
      {createdPrescription && (
        <PharmacySelectionModal
          isOpen={isPharmacyModalOpen}
          onClose={() => {
            setIsPharmacyModalOpen(false);
            setCreatedPrescription(null);
            onSuccess?.();
            onClose();
          }}
          prescriptionId={createdPrescription!.prescriptionId}
          patientName={createdPrescription!.patientName}
          medicineName={createdPrescription!.medicineName}
          onSuccess={() => {
            setIsPharmacyModalOpen(false);
            setCreatedPrescription(null);
            onSuccess?.();
            onClose();
          }}
        />
      )}
    </>
  );
};
