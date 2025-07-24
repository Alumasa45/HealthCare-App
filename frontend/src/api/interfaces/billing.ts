export interface Bill {
  Bill_id?: number;
  Patient_id: number;
  Appointment_id?: number;
  Prescription_id?: number;
  Order_id?: number;
  Bill_Date: Date | string;
  Due_Date: Date | string;
  Amount: number;
  Tax_Amount: number;
  Discount_Amount: number;
  Total_Amount: number;
  Payment_Status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  Payment_Method?: 'Cash' | 'Card' | 'Insurance' | 'Mobile Money';
  Payment_Date?: Date | string;
  Description: string;
  Created_at?: Date | string;
  Updated_at?: Date | string;
}

export interface CreateBillDto {
  Patient_id: number;
  Appointment_id?: number;
  Prescription_id?: number;
  Order_id?: number;
  Bill_Date: Date | string;
  Due_Date: Date | string;
  Amount: number;
  Tax_Amount: number;
  Discount_Amount: number;
  Total_Amount: number;
  Payment_Status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  Description: string;
}