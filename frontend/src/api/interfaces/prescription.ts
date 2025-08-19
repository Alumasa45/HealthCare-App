export interface Prescription {
  Prescription_id: number;
  Patient_id: number;
  Doctor_id: number;
  Appointment_id?: number | null;
  Medicine_Name: string;
  Prescription_Number: string;
  Issue_Date: Date;
  Validity_Period: Date;
  Total_Amount: number;
  Status: "Active" | "Completed" | "Expired";
  Notes: string;
  Created_at?: Date;
  Updated_at?: Date;
  // Relations for display
  doctor?: {
    Doctor_id: number;
    user: {
      First_Name: string;
      Last_Name: string;
    };
    Specialization: string;
    Department: string;
  };
  patient?: {
    Patient_id: number;
    user: {
      First_Name: string;
      Last_Name: string;
    };
  };
}

export interface PrescriptionInfo {
  Prescription_id: number;
  Patient_id: number;
  Doctor_id: number;
  Appointment_id: number;
  Medicine_Name: string;
  Prescription_Number: string;
  Issue_Date: Date;
  Validity_Period: Date;
  Total_Amount: number;
  Status: "Active" | "Completed" | "Expired";
  Notes: string;
  // Relations for display
  doctor?: {
    Doctor_id: number;
    user: {
      First_Name: string;
      Last_Name: string;
    };
    Specialization: string;
    Department: string;
  };
  patient?: {
    Patient_id: number;
    user: {
      First_Name: string;
      Last_Name: string;
    };
  };
}
