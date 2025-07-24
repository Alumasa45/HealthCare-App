import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentApi } from '@/api/appointments';
import { AppointmentBooking } from './AppointmentBooking';
import { CalendarDays, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Appointment } from '@/api/interfaces/appointment';

export function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.User_id) return;
      
      try {
        setLoading(true);
        const appointmentsData = await appointmentApi.getAll();
        setAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [user]);

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString: string | Date) => {
    if (!timeString) return 'N/A';
    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'No Show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full min-h-screen bg-white dark:bg-gray-900 p-4 md:p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Appointments</h2>
        <AppointmentBooking />
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.isArray(appointments) && appointments.map((appointment) => (
            <div 
              key={appointment.Appointment_id} 
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">Appointment #{appointment.Appointment_id}</h3>
                <span 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.Status)}`}
                >
                  {appointment.Status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(appointment.Appointment_Date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="font-medium">{formatTime(appointment.Appointment_Time)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>{" "}
                  {appointment.Appointment_Type}
                </p>
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Reason:</span>{" "}
                  {appointment.Reason_For_Visit}
                </p>
                {appointment.Notes && (
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span>{" "}
                    {appointment.Notes}
                  </p>
                )}
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Payment:</span>{" "}
                  <span className={appointment.Payment_Status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}>
                    {appointment.Payment_Status === 'Paid' ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Paid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {appointment.Payment_Status}
                      </span>
                    )}
                  </span>
                </p>
              </div>
              
              <div className="mt-4 flex justify-end gap-2">
                {appointment.Status === 'Scheduled' && (
                  <button className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors">
                    Cancel
                  </button>
                )}
                <button className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-md hover:bg-purple-200 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="mx-auto w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <CalendarDays className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No appointments found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            You don't have any appointments scheduled yet.
          </p>
          <AppointmentBooking />
        </div>
      )}
    </div>
  );
}