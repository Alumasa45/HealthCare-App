import type { Patient } from "../patients";
import type { User } from "./user";

export interface Appointment {
    Appointment_id: number;
    Patient_id?: number;
    Doctor_id?: number;
    Appointment_Date: Date;
    Appointment_Time: Date;
    Appointment_Type: 'In-Person' | 'TeleMedicine' | 'Follow-up';
    Status:  'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
    Reason_For_Visit: string;
    Notes: string;
    Payment_Status: 'Transaction pending' | 'Paid';
    Created_at: Date;
    Updated_at: Date;
    user?: User
}

export interface AppointmentInfo {
    Patient_id: number;
    Doctor_id: number;
    Appointment_Date: string | Date;
    Appointment_Time: string | Date;
    Appointment_Type: 'In-Person' | 'TeleMedicine' | 'Follow-Up';
    Status: 'Scheduled' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
    Reason_For_Visit: string;
    Notes: string;
    Payment_Status: 'Transaction Pending' | 'Paid';
    Slot_id?: number;
}