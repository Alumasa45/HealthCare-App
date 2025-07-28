import React, { useEffect, useState } from "react";
import { FileText, Search, Eye, Plus } from "lucide-react";
import { recordsApi } from "@/api/records";
import { useAuth } from "@/contexts/AuthContext";
import { doctorApi } from "@/api/doctors";
import { toast } from "sonner";
import { MedicalRecordModal } from "@/components/MedicalRecordModal";
import type { MedicalRecords } from "@/api/interfaces/record";

const MedicalRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecords[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecords | null>(
    null
  );

  useEffect(() => {
    fetchRecords();
  }, [user?.User_id]);

  const fetchRecords = async () => {
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

      const recordsData = await recordsApi.findAll();
      // Filter records for this doctor's patients
      setRecords(recordsData);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      setError("Failed to load medical records");
      toast.error("Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    const search = searchTerm.toLowerCase();
    return (
      record.Record_id.toString().includes(search) ||
      record.Patient_id.toString().includes(search) ||
      record.Diagnosis?.toLowerCase().includes(search) ||
      record.Treatment_Plan?.toLowerCase().includes(search)
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
          <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Records
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRecords}
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
              Medical Records
            </h1>
            <p className="text-gray-600">
              View and manage patient medical records
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Record</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search records by ID, patient, diagnosis, or treatment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Records grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No medical records found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "No records match your search criteria."
                : "No medical records available."}
            </p>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record.Record_id}
              className="bg-white rounded-lg shadow border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-gray-900">
                    Record #{record.Record_id}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Patient ID: {record.Patient_id}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(record.Visit_Date).toLocaleDateString()}
                  </p>
                </div>

                {record.Diagnosis && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Diagnosis
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {record.Diagnosis}
                    </p>
                  </div>
                )}

                {record.Treatment_Plan && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Treatment
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {record.Treatment_Plan}
                    </p>
                  </div>
                )}

                {record.Notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notes</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {record.Notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Full Record</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Medical Record Modal */}
      {isModalOpen && (
        <MedicalRecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patientId={0} // You might want to add patient selection
          doctorId={user?.Doctor_id || 0}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchRecords();
          }}
        />
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Medical Record #{selectedRecord.Record_id}
                </h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Patient ID</h4>
                  <p className="text-gray-600">{selectedRecord.Patient_id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Record Date
                  </h4>
                  <p className="text-gray-600">
                    {new Date(selectedRecord.Visit_Date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedRecord.Diagnosis && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                  <p className="text-gray-600">{selectedRecord.Diagnosis}</p>
                </div>
              )}

              {selectedRecord.Treatment_Plan && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Treatment</h4>
                  <p className="text-gray-600">{selectedRecord.Treatment_Plan}</p>
                </div>
              )}

              {selectedRecord.Notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-600">{selectedRecord.Notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsPage;
