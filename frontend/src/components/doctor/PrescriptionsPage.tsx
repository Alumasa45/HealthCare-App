import React, { useEffect, useState } from "react";
import {
  Pill,
  Search,
  User,
  Calendar,
  FileText,
  Eye,
  Plus,
} from "lucide-react";
import { prescriptionapi } from "../../api/prescriptions";
import type { Prescription } from "../../api/interfaces/prescription";
import { useAuth } from "@/contexts/AuthContext";
import { doctorApi } from "@/api/doctors";
import { toast } from "sonner";
import { CreatePrescriptionModal } from "@/components/CreatePrescriptionModal";

const PrescriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, [user?.User_id]);

  const fetchPrescriptions = async () => {
    if (!user?.User_id) return;

    try {
      setLoading(true);
      setError(null);

      // Get doctor ID
      let doctorId = user.Doctor_id;
      if (!doctorId && user.User_Type === "Doctor") {
        const doctorData = await doctorApi.findByUserId(user.User_id);
        doctorId = doctorData.Doctor_id;
      }

      if (!doctorId) {
        setError("Doctor ID not found");
        return;
      }

      const prescriptionData = await prescriptionapi.findAll();
      setPrescriptions(prescriptionData);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setError("Failed to load prescriptions");
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const patientName = `${prescription.patient?.user?.First_Name || ""} ${
      prescription.patient?.user?.Last_Name || ""
    }`.toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      patientName.includes(search) ||
      prescription.Prescription_id.toString().includes(search) ||
      prescription.Patient_id.toString().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Pill className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Prescriptions
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPrescriptions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Prescriptions
            </h1>
            <p className="text-gray-600">
              Manage patient prescriptions and medications
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Prescription</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search prescriptions by patient name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Pill className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {prescriptions.length}
              </p>
              <p className="text-gray-600">Total Prescriptions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {
                  prescriptions.filter((p) => {
                    const date = new Date(p.Issue_Date);
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
                  }).length
                }
              </p>
              <p className="text-gray-600">Today's Prescriptions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <User className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {new Set(prescriptions.map((p) => p.Patient_id)).size}
              </p>
              <p className="text-gray-600">Unique Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions list */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No prescriptions found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "No prescriptions match your search criteria."
                : "You have not created any prescriptions yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prescription ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrescriptions.map((prescription) => (
                  <tr
                    key={prescription.Prescription_id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{prescription.Prescription_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-8 w-8 text-gray-400" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {prescription.patient?.user?.First_Name}{" "}
                            {prescription.patient?.user?.Last_Name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Patient ID: {prescription.Patient_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(
                        prescription.Issue_Date
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {prescription.Medicine_Name ? (
                          <div>
                            <div className="font-medium">
                              {prescription.Medicine_Name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            No medications listed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedPrescription(prescription)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      {isCreateModalOpen && (
        <CreatePrescriptionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          Doctor_id={user?.Doctor_id || 0}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchPrescriptions();
          }}
        />
      )}

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Prescription #{selectedPrescription.Prescription_id}
                </h3>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FileText className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Patient Information
                </h4>
                <p className="text-gray-600">
                  {selectedPrescription.patient?.user?.First_Name}{" "}
                  {selectedPrescription.patient?.user?.Last_Name}
                </p>
                <p className="text-sm text-gray-500">
                  Patient ID: {selectedPrescription.Patient_id}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Prescription Date
                </h4>
                <p className="text-gray-600">
                  {new Date(
                    selectedPrescription.Issue_Date
                  ).toLocaleDateString()}
                </p>
              </div>

              {selectedPrescription.Notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    General Notes
                  </h4>
                  <p className="text-gray-600">
                    {selectedPrescription.Notes}
                  </p>
                </div>
              )}

              {selectedPrescription.Medicine_Name && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Medications
                  </h4>
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900">
                        {selectedPrescription.Medicine_Name}
                      </h5>
                      <div className="mt-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Notes:</span>{" "}
                          {selectedPrescription.Notes || "No notes provided"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsPage;
