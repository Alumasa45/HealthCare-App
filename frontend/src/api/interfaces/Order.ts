export interface Order {
    Order_id?: number;
    Patient_id: number;
    Pharmacy_id: number;
    Prescription_id: number;
    Order_Number: string;
    Order_Date: Date;
    Order_Type : 'Prescription' | 'Over the counter' | 'Refill';
    Subtotal: number;
    Delivery_Charges: number;
    Tax_Amount: number;
    Total_Amount: number;
    Payment_Method: 'Cash' | 'Card' | 'Mobile Money' | 'Insurance';
    Payment_Status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
    Order_Status: 'Placed' | 'Confirmed' | 'Preparing' | 'Ready' | 'Dispatched' | 'Delivered' | 'Cancelled';
    Delivery_Address: string;
    Delivery_Instructions: string;
    Estimated_Delivery: Date;
    Created_at?: Date;
    Updated_at?: Date;
}

export interface OrderInfo {
    Patient_id: number;
    Pharmacy_id: number;
    Prescription_id: number;
    Order_Number: string;
    Order_Date: Date;
    Order_Type : 'Prescription' | 'Over the counter' | 'Refill';
    Subtotal: number;
    Delivery_Charges: number;
    Tax_Amount: number;
    Total_Amount: number;
    Payment_Method: 'Cash' | 'Card' | 'Mobile Money' | 'Insurance';
    Payment_Status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
    Order_Status: 'Placed' | 'Confirmed' | 'Preparing' | 'Ready' | 'Dispatched' | 'Delivered' | 'Cancelled';
    Delivery_Address: string;
    Delivery_Instructions: string;
    Estimated_Delivery: Date;
}