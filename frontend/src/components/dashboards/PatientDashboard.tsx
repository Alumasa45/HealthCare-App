import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Pill,
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Send,
} from "lucide-react";
import type { Appointment } from "@/api/interfaces/appointment";
import type { PrescriptionInfo } from "@/api/interfaces/prescription";
import type { DoctorInfo } from "@/api/interfaces/doctor";
import type { Order, OrderInfo } from "@/api/interfaces/Order";
import type { Bill } from "@/api/interfaces/billing";
import { appointmentApi } from "@/api/appointments";
import { prescriptionapi } from "@/api/prescriptions";
import { doctorApi } from "@/api/doctors";
import { useNavigate } from "@tanstack/react-router";
import { orderApi } from "@/api/orders";
import { billingApi } from "@/api/billing";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { patientApi } from "@/api/patients";
import { PharmacySelectionModal } from "@/components/PharmacySelectionModal";
import { NotificationCenter } from "@/components/NotificationCenter";

type TabType =
  | "appointments"
  | "prescriptions"
  | "doctors"
  | "orders"
  | "billing";

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionInfo[]>([]);
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<PrescriptionInfo | null>(null);

  // Get current patient data
  useEffect(() => {
    const fetchCurrentPatient = async () => {
      if (user?.User_id && user.User_Type === "Patient") {
        try {
          const patientData = await patientApi.getByUserId(user.User_id);
          setCurrentPatient(patientData);
        } catch (error) {
          console.error("Error fetching current patient:", error);
        }
      }
    };
    fetchCurrentPatient();
  }, [user]);

  // Fetch appointments data from API.
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await appointmentApi.getAll();
        // Ensure data is always an array
        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          console.warn("Appointments API returned non-array data:", data);
          setAppointments([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch appointments"
        );
        console.error("Error fetching appointments:", err);
        // Set empty array on error to prevent map errors
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  //fetch prescriptions data from Api - Filter by current patient
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!currentPatient?.Patient_id) return;

      try {
        setLoading(true);
        setError(null);
        const prescriptiondata: PrescriptionInfo[] =
          await prescriptionapi.findByPatientId(currentPatient.Patient_id);
        // Ensure data is always an array
        if (Array.isArray(prescriptiondata)) {
          setPrescriptions(prescriptiondata);
        } else {
          console.warn(
            "Prescriptions API returned non-array data:",
            prescriptiondata
          );
          setPrescriptions([]);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch prescriptions"
        );
        console.error("Error fetching prescriptions:", error);
        // Set empty array on error to prevent map errors
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [currentPatient]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const doctordata: DoctorInfo[] = await doctorApi.getAll();
        // Ensure data is always an array
        if (Array.isArray(doctordata)) {
          setDoctors(doctordata);
        } else {
          console.warn("Doctors API returned non-array data:", doctordata);
          setDoctors([]);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch doctors:"
        );
        console.error("Error fetching doctors:", error);
        // Set empty array on error to prevent map errors
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderData: OrderInfo[] = await orderApi.findAll();
        // Ensure data is always an array
        if (Array.isArray(orderData)) {
          setOrders(orderData);
        } else {
          console.warn("Orders API returned non-array data:", orderData);
          setOrders([]);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch orders"
        );
        console.error("Error fetching orders:", error);
        // Set empty array on error to prevent map errors
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true);
        setError(null);
        const billData = await billingApi.findAll();
        // Ensure data is always an array
        if (Array.isArray(billData)) {
          setBills(billData);
        } else {
          console.warn("Bills API returned non-array data:", billData);
          setBills([]);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch bills"
        );
        console.error("Error fetching bills:", error);
        // Set empty array on error to prevent map errors
        setBills([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    if (typeof date === "string") {
      if (date.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return date.slice(0, 5); // Return HH:MM
      }
      // If it's full datetime, convert to Date object
      const dateObj = new Date(date);
      return dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderAppointments = () => {
    const handleClick = () => {
      navigate({ to: "/appointments", replace: true });
    };
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading appointments...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            My Appointments ({appointments?.length || 0})
          </h2>
          <button
            onClick={handleClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md transition-colors"
          >
            Book New Appointment
          </button>
        </div>

        {!appointments ||
        !Array.isArray(appointments) ||
        appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No appointments found. Schedule your first appointment!
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.Appointment_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                      Appointment #{appointment.Appointment_id}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Appointment Date:
                        </span>
                        <Calendar className="h-4 w-4" />
                        {formatDate(appointment.Appointment_Date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Appointment Time:
                        </span>
                        <Clock className="h-4 w-4" />
                        {formatTime(appointment.Appointment_Time)}
                      </div>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-xs">
                        {appointment.Appointment_Type}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Reason:
                        </span>{" "}
                        {appointment.Reason_For_Visit}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Notes:
                        </span>{" "}
                        {appointment.Notes}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Payment:
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(
                            appointment.Payment_Status
                          )}`}
                        >
                          {appointment.Payment_Status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      appointment.Status
                    )}`}
                  >
                    {appointment.Status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderPrescriptions = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-purple-600">Loading Prescriptions...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    const handleSendToPharmacy = async (prescription: PrescriptionInfo) => {
      setSelectedPrescription(prescription);
      setShowPharmacyModal(true);
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            My Prescriptions ({prescriptions?.length || 0})
          </h2>
        </div>

        {!prescriptions ||
        !Array.isArray(prescriptions) ||
        prescriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No prescriptions found. Your doctor will send prescriptions to your
            account after appointments.
          </div>
        ) : (
          <div className="grid gap-4">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.Prescription_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        Prescription #{prescription.Prescription_id}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          prescription.Status
                        )}`}
                      >
                        {prescription.Status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Medicine:
                          </span>{" "}
                          <span className="text-purple-600 font-semibold">
                            {prescription.Medicine_Name}
                          </span>
                        </div>

                        {prescription.doctor && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Prescribed by:
                            </span>{" "}
                            <span className="text-blue-600">
                              Dr. {prescription.doctor.user.First_Name}{" "}
                              {prescription.doctor.user.Last_Name}
                            </span>
                            <div className="text-xs text-gray-500">
                              {prescription.doctor.Specialization} •{" "}
                              {prescription.doctor.Department}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Prescription Number:
                          </span>{" "}
                          {prescription.Prescription_Number}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Issue Date:
                          </span>{" "}
                          {formatDate(prescription.Issue_Date)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Valid Until:
                          </span>{" "}
                          {formatDate(prescription.Validity_Period)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Total Amount:
                          </span>{" "}
                          <span className="text-green-600 font-semibold">
                            ${prescription.Total_Amount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {prescription.Notes && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Doctor's Notes:
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {prescription.Notes}
                        </p>
                      </div>
                    )}

                    {prescription.Status === "Active" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSendToPharmacy(prescription)}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Send to Pharmacy
                        </Button>
                      </div>
                    )}

                    {prescription.Status === "Expired" && (
                      <div className="text-red-600 text-sm">
                        This prescription has expired. Please consult your
                        doctor for a new prescription.
                      </div>
                    )}

                    {prescription.Status === "Completed" && (
                      <div className="text-green-600 text-sm">
                        This prescription has been completed.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDoctors = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-purple-600">Loading Doctors...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            My Doctors ({doctors?.length || 0})
          </h2>
        </div>

        {!doctors || !Array.isArray(doctors) || doctors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No doctors found.
          </div>
        ) : (
          <div className="grid gap-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.Doctor_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                      Dr. {doctor.User_id}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Specialization:
                        </span>{" "}
                        {doctor.Specialization}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Qualification:
                        </span>{" "}
                        {doctor.Qualification}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Experience years:
                        </span>{" "}
                        {doctor.Experience_Years}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Department:
                        </span>{" "}
                        {doctor.Department}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Biography:
                        </span>{" "}
                        {doctor.Bio}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Languages Spoken:
                        </span>{" "}
                        {doctor.Languages_Spoken}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Availability Online:
                        </span>{" "}
                        {doctor.Is_Available_Online}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Doctor Rating:
                        </span>{" "}
                        {doctor.Rating}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Reviews:
                        </span>{" "}
                        {doctor.Reviews}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderOrders = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-purple-600">Loading Orders...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            My Orders ({orders?.length || 0})
          </h2>
        </div>

        {!orders || !Array.isArray(orders) || orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No orders found.</div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.Order_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                      Order #{order.Order_id}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Total Amount:
                        </span>{" "}
                        {order.Total_Amount}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Status:
                        </span>{" "}
                        {order.Order_Status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
      case "Active":
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
      case "Paid":
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
      case "Preparing":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
      case "Expired":
      case "Discontinued":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderBilling = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-purple-600">Loading Bills...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    const handlePayBill = async (billId: number) => {
      try {
        await billingApi.payBill(billId.toString(), "Card");
        toast.success("Payment successful!");
        // Refresh bills
        const updatedBills = await billingApi.findAll();
        setBills(updatedBills);
      } catch (error) {
        toast.error("Payment failed. Please try again.");
        console.error("Error processing payment:", error);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            My Bills ({bills?.length || 0})
          </h2>
        </div>

        {!bills || !Array.isArray(bills) || bills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No bills found.</div>
        ) : (
          <div className="grid gap-4">
            {bills.map((bill) => (
              <div
                key={bill.Bill_id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        Bill #{bill.Bill_id}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          bill.Payment_Status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : bill.Payment_Status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : bill.Payment_Status === "Overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {bill.Payment_Status === "Paid" && (
                          <CheckCircle className="inline-block w-4 h-4 mr-1" />
                        )}
                        {bill.Payment_Status === "Pending" && (
                          <Clock className="inline-block w-4 h-4 mr-1" />
                        )}
                        {bill.Payment_Status === "Overdue" && (
                          <AlertCircle className="inline-block w-4 h-4 mr-1" />
                        )}
                        {bill.Payment_Status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Description:
                        </span>{" "}
                        {bill.Description}
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Bill Date:
                          </span>{" "}
                          {formatDate(bill.Bill_Date)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Due Date:
                          </span>{" "}
                          {formatDate(bill.Due_Date)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Amount:
                          </span>{" "}
                          ${bill.Amount.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Tax:
                          </span>{" "}
                          ${bill.Tax_Amount.toFixed(2)}
                        </div>
                        {bill.Discount_Amount > 0 && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Discount:
                            </span>{" "}
                            -${bill.Discount_Amount.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-lg text-gray-900 dark:text-gray-100">
                          Total: ${bill.Total_Amount.toFixed(2)}
                        </span>
                      </div>
                      {bill.Payment_Status === "Paid" && (
                        <div className="mt-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="inline-block w-4 h-4 mr-1" />
                          Paid on {formatDate(bill.Payment_Date || "")} via{" "}
                          {bill.Payment_Method}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {(bill.Payment_Status === "Pending" ||
                  bill.Payment_Status === "Overdue") && (
                  <div className="mt-4">
                    <Button
                      onClick={() => handlePayBill(bill.Bill_id || 0)}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                    >
                      Pay Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return renderAppointments();
      case "prescriptions":
        return renderPrescriptions();
      case "doctors":
        return renderDoctors();
      case "orders":
        return renderOrders();
      case "billing":
        return renderBilling();
      default:
        return renderAppointments();
    }
  };

  return (
    <div>
      {/* Header with Navigation and Notifications */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Patient Dashboard
          </h1>
          <NotificationCenter />
        </div>
        <nav className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { id: "appointments", label: "Appointments", icon: Calendar },
            { id: "prescriptions", label: "Prescriptions", icon: Pill },
            { id: "doctors", label: "My Doctors", icon: User },
            { id: "orders", label: "My Orders", icon: FileText },
            { id: "billing", label: "Billing", icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all duration-200 font-medium ${
                  activeTab === tab.id
                    ? "border-purple-500 bg-purple-50 text-purple-600 shadow-md"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-8 w-8" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
      <div className="mb-8">{renderContent()}</div>

      {/* Pharmacy Selection Modal */}
      {showPharmacyModal && selectedPrescription && currentPatient && (
        <PharmacySelectionModal
          isOpen={showPharmacyModal}
          onClose={() => {
            setShowPharmacyModal(false);
            setSelectedPrescription(null);
          }}
          prescription={selectedPrescription}
          patientId={currentPatient.Patient_id}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
