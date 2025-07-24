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
import { toast } from "sonner";
import type { Appointment } from "@/api/interfaces/appointment";

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
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
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
      const appointmentData = (await appointmentApi.getByDoctorId(
        Doctor_id
      )) as ExtendedAppointment[];

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

      const patientsArray = Array.from(uniquePatients.values());
      setPatients(patientsArray);
      console.log(
        `Found ${patientsArray.length} patients for doctor ${Doctor_id}`
      );
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients who have appointments with you");
    }
  };

  const fetchAppointments = async () => {
    try {
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

      const prescriptionData = {
        Patient_id: parseInt(formData.Patient_id),
        Doctor_id: Doctor_id,
        Appointment_id: formData.Appointment_id
          ? parseInt(formData.Appointment_id)
          : 0,
        Medicine_Name: formData.Medicine_Name,
        Prescription_Number: formData.Prescription_Number,
        Issue_Date: new Date(formData.Issue_Date),
        Validity_Period: new Date(formData.Validity_Period),
        Total_Amount: parseFloat(formData.Total_Amount),
        Status: "Active" as const,
        Notes: formData.Notes,
      };

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create prescription");
      }

      const result = await response.json();

      toast.success("Prescription created and sent to patient successfully!");
      onSuccess?.();
      onClose();

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
      toast.error("Failed to create prescription");
      console.error("Error creating prescription:", error);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Pill className="h-5 w-5 text-purple-600" />
              Create New Prescription
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select from patients who have appointments with you
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-160px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
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
              <Label htmlFor="appointment">
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
            <Label htmlFor="medicine">Medicine Name *</Label>
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
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prescriptionNumber">Prescription Number</Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Total Amount ($) *</Label>
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
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validityPeriod">Valid Until *</Label>
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Instructions/Notes</Label>
            <textarea
              id="notes"
              value={formData.Notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, Notes: e.target.value }))
              }
              placeholder="Enter dosage instructions, warnings, or additional notes..."
              rows={3}
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Prescription Summary:
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <span className="font-medium">Patient:</span>{" "}
                {formData.Patient_id
                  ? patients.find(
                      (p) => p.Patient_id.toString() === formData.Patient_id
                    )?.user
                    ? `${
                        patients.find(
                          (p) => p.Patient_id.toString() === formData.Patient_id
                        )?.user?.First_Name
                      } ${
                        patients.find(
                          (p) => p.Patient_id.toString() === formData.Patient_id
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
  );
};
