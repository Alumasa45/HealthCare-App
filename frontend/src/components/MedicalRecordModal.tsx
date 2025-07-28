import React, { useState } from "react";
import { X, FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordsApi } from "@/api/records";
import { toast } from "sonner";
import type { MedicalRecords } from "@/api/interfaces/record";

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  doctorId: number;
  appointmentId?: number;
  onSuccess?: () => void;
}

export const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  isOpen,
  onClose,
  patientId,
  doctorId,
  appointmentId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Visit_Date: new Date().toISOString().split("T")[0],
    Diagnosis: "",
    Symptoms: "",
    Treatment_Plan: "",
    Notes: "",
    Follow_up_Required: false,
    Follow_Up_Date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const recordData: Partial<MedicalRecords> = {
        Patient_id: patientId,
        Doctor_id: doctorId,
        Visit_Date: new Date(formData.Visit_Date),
        Diagnosis: formData.Diagnosis,
        Symptoms: formData.Symptoms,
        Treatment_Plan: formData.Treatment_Plan,
        Notes: formData.Notes,
        Follow_up_Required: formData.Follow_up_Required,
        Follow_Up_Date: formData.Follow_up_Required
          ? new Date(formData.Follow_Up_Date)
          : new Date(),
      };

      await recordsApi.create(recordData as MedicalRecords);

      toast.success("Medical record created successfully!");
      onSuccess?.();
      onClose();

      // Reset form
      setFormData({
        Visit_Date: new Date().toISOString().split("T")[0],
        Diagnosis: "",
        Symptoms: "",
        Treatment_Plan: "",
        Notes: "",
        Follow_up_Required: false,
        Follow_Up_Date: "",
      });
    } catch (error) {
      console.error("Error creating medical record:", error);
      toast.error("Failed to create medical record");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Create Medical Record
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Document patient consultation and treatment details
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
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="visitDate">Visit Date *</Label>
              <Input
                id="visitDate"
                type="date"
                value={formData.Visit_Date}
                onChange={(e) =>
                  handleInputChange("Visit_Date", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Input
                id="diagnosis"
                value={formData.Diagnosis}
                onChange={(e) => handleInputChange("Diagnosis", e.target.value)}
                placeholder="Patient diagnosis..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms Presented *</Label>
            <Textarea
              id="symptoms"
              value={formData.Symptoms}
              onChange={(e) => handleInputChange("Symptoms", e.target.value)}
              placeholder="Describe the symptoms presented by the patient..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentPlan">Treatment Plan *</Label>
            <Textarea
              id="treatmentPlan"
              value={formData.Treatment_Plan}
              onChange={(e) =>
                handleInputChange("Treatment_Plan", e.target.value)
              }
              placeholder="Outline the recommended treatment plan..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.Notes}
              onChange={(e) => handleInputChange("Notes", e.target.value)}
              placeholder="Any additional observations or instructions..."
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={formData.Follow_up_Required}
                onChange={(e) =>
                  handleInputChange("Follow_up_Required", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="followUpRequired">
                Follow-up appointment required
              </Label>
            </div>

            {formData.Follow_up_Required && (
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.Follow_Up_Date}
                  onChange={(e) =>
                    handleInputChange("Follow_Up_Date", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            )}
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Medical Record
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
