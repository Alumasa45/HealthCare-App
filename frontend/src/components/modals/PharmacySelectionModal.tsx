import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, MapPin, Phone, Mail, Clock, Truck, Star, Send } from "lucide-react";
import { pharmacyApi, type Pharmacy } from "@/api/pharmacies";

interface PharmacySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescriptionId: number;
  patientName: string;
  medicineName: string;
  onSuccess?: () => void;
}

export const PharmacySelectionModal: React.FC<PharmacySelectionModalProps> = ({
  isOpen,
  onClose,
  prescriptionId,
  patientName,
  medicineName,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(
    null
  );
  const [sendingToPharamcy, setSendingToPharmacy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPharmacies();
    }
  }, [isOpen]);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      const data = await pharmacyApi.findAll();
      // Filter for verified pharmacies only
      const verifiedPharmacies = data.filter(
        (pharmacy) => pharmacy.Is_Verified
      );
      setPharmacies(verifiedPharmacies);

      if (verifiedPharmacies.length === 0) {
        toast.info("No verified pharmacies found. Please contact support.");
      }
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
      toast.error("Failed to load pharmacies");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToPharamcy = async () => {
    if (!selectedPharmacy) {
      toast.error("Please select a pharmacy");
      return;
    }

    try {
      setSendingToPharmacy(true);

      // Here you would typically call an API to send the prescription to the pharmacy
      // For now, we'll simulate this with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        `Prescription sent to ${selectedPharmacy.Pharmacy_Name} successfully!`
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error sending prescription to pharmacy:", error);
      toast.error("Failed to send prescription to pharmacy");
    } finally {
      setSendingToPharmacy(false);
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const isPharmacyOpen = (openTime: string, closeTime: string) => {
    try {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const [openHour, openMin] = openTime.split(":").map(Number);
      const [closeHour, closeMin] = closeTime.split(":").map(Number);

      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      return currentTime >= openMinutes && currentTime <= closeMinutes;
    } catch {
      return true; // Default to open if we can't parse times
    }
  };

  const handleClose = () => {
    if (!sendingToPharamcy) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Send className="h-6 w-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Send Prescription to Pharmacy
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {medicineName} for {patientName}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={sendingToPharamcy}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Loading pharmacies...
              </span>
            </div>
          ) : pharmacies.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Verified Pharmacies Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Please contact support to add verified pharmacies to the system.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a Pharmacy ({pharmacies.length} available)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose a verified pharmacy to send the prescription to.
                </p>
              </div>

              <div className="grid gap-4">
                {pharmacies.map((pharmacy) => {
                  const isOpen = isPharmacyOpen(
                    pharmacy.Opening_Time,
                    pharmacy.Closing_Time
                  );
                  const isSelected =
                    selectedPharmacy?.Pharmacy_id === pharmacy.Pharmacy_id;

                  return (
                    <div
                      key={pharmacy.Pharmacy_id}
                      onClick={() => setSelectedPharmacy(pharmacy)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-400"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {pharmacy.Pharmacy_Name}
                            </h4>
                            <div className="flex items-center gap-2">
                              {pharmacy.Is_Verified && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Verified
                                </span>
                              )}
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  isOpen
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {isOpen ? "Open" : "Closed"}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{pharmacy.Phone_Number}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{pharmacy.Email}</span>
                              </div>
                              {pharmacy.Address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{pharmacy.Address}</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatTime(pharmacy.Opening_Time)} -{" "}
                                  {formatTime(pharmacy.Closing_Time)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span>
                                  {pharmacy.Delivery_Available
                                    ? "Delivery Available"
                                    : "No Delivery"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                <span>
                                  Rating:{" "}
                                  {typeof pharmacy.Rating === "number" &&
                                  !isNaN(pharmacy.Rating)
                                    ? pharmacy.Rating.toFixed(1)
                                    : "N/A"}
                                  /5
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="ml-4">
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={sendingToPharamcy}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 rounded-md font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendToPharamcy}
            disabled={!selectedPharmacy || sendingToPharamcy}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sendingToPharamcy ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send to{" "}
                {selectedPharmacy ? selectedPharmacy.Pharmacy_Name : "Pharmacy"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
