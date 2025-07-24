import React, { useState, useEffect } from "react";
import { X, Clock, Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pharmacistApi } from "@/api/pharmacists";
import { orderApi } from "@/api/orders";
import { toast } from "sonner";
import type { Pharmacist } from "@/api/interfaces/pharmacist";
import type { PrescriptionInfo } from "@/api/interfaces/prescription";

interface PharmacySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: PrescriptionInfo;
  patientId: number;
}

export const PharmacySelectionModal: React.FC<PharmacySelectionModalProps> = ({
  isOpen,
  onClose,
  prescription,
  patientId,
}) => {
  const [pharmacies, setPharmacies] = useState<Pharmacist[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacist | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      fetchPharmacies();
    }
  }, [isOpen]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const data = await pharmacistApi.getAll();
      setPharmacies(data);
    } catch (error) {
      toast.error("Failed to load pharmacies");
      console.error("Error fetching pharmacies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToPharmacy = async () => {
    if (!selectedPharmacy) {
      toast.error("Please select a pharmacy");
      return;
    }

    try {
      setSending(true);

      // Create an order for the prescription
      const orderData = {
        Patient_id: patientId,
        Pharmacy_id: selectedPharmacy.Pharmacy_id,
        Prescription_id: prescription.Prescription_id,
        Order_Number: `ORD-${Date.now()}`,
        Order_Date: new Date(),
        Order_Type: "Prescription" as const,
        Subtotal: prescription.Total_Amount,
        Delivery_Charges: 0,
        Tax_Amount: 0,
        Total_Amount: prescription.Total_Amount,
        Payment_Method: "Cash" as const,
        Payment_Status: "Pending" as const,
        Order_Status: "Placed" as const,
        Delivery_Address: "Patient Address", // You would get this from patient data
        Delivery_Instructions: "",
        Estimated_Delivery: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };

      await orderApi.create(orderData);

      toast.success(
        `Prescription sent to ${selectedPharmacy.Pharmacy_Name} successfully!`
      );
      onClose();
    } catch (error) {
      toast.error("Failed to send prescription to pharmacy");
      console.error("Error sending to pharmacy:", error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Pharmacy for Prescription #{prescription.Prescription_id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">
              Prescription Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-purple-700">Medicine:</span>{" "}
                {prescription.Medicine_Name}
              </div>
              <div>
                <span className="text-purple-700">Amount:</span> $
                {prescription.Total_Amount}
              </div>
              <div>
                <span className="text-purple-700">Prescription #:</span>{" "}
                {prescription.Prescription_Number}
              </div>
              <div>
                <span className="text-purple-700">Valid Until:</span>{" "}
                {new Date(prescription.Validity_Period).toLocaleDateString()}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-600">Loading pharmacies...</div>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pharmacies.map((pharmacy) => (
                <div
                  key={pharmacy.Pharmacy_id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPharmacy?.Pharmacy_id === pharmacy.Pharmacy_id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPharmacy(pharmacy)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {pharmacy.Pharmacy_Name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">
                        {pharmacy.Rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {pharmacy.Opening_Time} - {pharmacy.Closing_Time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          pharmacy.Delivery_Available
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {pharmacy.Delivery_Available
                          ? "Delivery Available"
                          : "Pickup Only"}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span className="font-medium">Contact:</span>{" "}
                      {pharmacy.Phone_Number} • {pharmacy.Email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            onClick={handleSendToPharmacy}
            disabled={!selectedPharmacy || sending}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {sending ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to Pharmacy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
