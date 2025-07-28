import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  User,
  FileText,
  Calendar,
} from "lucide-react";
import { appointmentApi } from "@/api/appointments";
import { useAuth } from "@/contexts/AuthContext";
import { doctorApi } from "@/api/doctors";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

interface Patient {
  Patient_id: number;
  User_id: number;
  user?: {
    First_Name?: string;
    Last_Name?: string;
    Email?: string;
    Phone?: string;
    Date_Of_Birth?: string;
  };
  appointmentCount?: number;
  lastAppointment?: string;
}

const PatientsPage: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, [user?.User_id]);

  const fetchPatients = async () => {
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

      // Get appointments to extract unique patients
      const appointments = await appointmentApi.getByDoctorId(doctorId);

      // Group patients and calculate stats
      const patientMap = new Map<number, Patient>();

      appointments.forEach((appointment) => {
        if (appointment.Patient_id && appointment.user) {
          const patientId = appointment.Patient_id;

          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, {
              Patient_id: patientId,
              User_id: appointment.user.User_id || 0,
              user: appointment.user,
              appointmentCount: 0,
              lastAppointment: appointment.Appointment_Date.toString(),
            });
          }

          const patient = patientMap.get(patientId)!;
          patient.appointmentCount = (patient.appointmentCount || 0) + 1;

          // Update last appointment if this one is more recent
          if (
            new Date(appointment.Appointment_Date) >
            new Date(patient.lastAppointment || "1900-01-01")
          ) {
            patient.lastAppointment = appointment.Appointment_Date.toString();
          }
        }
      });

      setPatients(Array.from(patientMap.values()));
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to load patients");
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.user?.First_Name || ""} ${
      patient.user?.Last_Name || ""
    }`.toLowerCase();
    const email = patient.user?.Email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      patient.Patient_id.toString().includes(search)
    );
  });

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

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
          <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Patients
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPatients}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Patients</h1>
        <p className="text-gray-600">Manage your patient relationships</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name, email, or ID..."
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
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {patients.length}
              </p>
              <p className="text-gray-600">Total Patients</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {patients.reduce(
                  (sum, p) => sum + (p.appointmentCount || 0),
                  0
                )}
              </p>
              <p className="text-gray-600">Total Appointments</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  (patients.reduce(
                    (sum, p) => sum + (p.appointmentCount || 0),
                    0
                  ) /
                    Math.max(patients.length, 1)) *
                    10
                ) / 10}
              </p>
              <p className="text-gray-600">Avg Appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patients list */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No patients found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "No patients match your search criteria."
                : "You have no patients yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.Patient_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-8 w-8 text-gray-400" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.user?.First_Name} {patient.user?.Last_Name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {patient.Patient_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.user?.Email && (
                          <div className="flex items-center mb-1">
                            <Mail className="h-3 w-3 text-gray-400 mr-1" />
                            {patient.user.Email}
                          </div>
                        )}
                        {patient.user?.Phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 text-gray-400 mr-1" />
                            {patient.user.Phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.user?.Date_Of_Birth
                        ? `${calculateAge(patient.user.Date_Of_Birth)} years`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {patient.appointmentCount} appointments
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.lastAppointment
                        ? new Date(patient.lastAppointment).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to="/doctor/medical-records"
                          search={{ patientId: patient.Patient_id }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Records
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          to="/doctor/prescriptions"
                          search={{ patientId: patient.Patient_id }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Prescriptions
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsPage;
