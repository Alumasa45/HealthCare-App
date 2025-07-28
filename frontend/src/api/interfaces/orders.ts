export interface MedicineOrder {
  Order_id?: number;
  Patient_id: number;
  Pharmacy_id: number;
  Prescription_id?: number;
  Order_Date: Date | string;
  Total_Amount: number;
  Order_Status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";
  Payment_Status: "Pending" | "Paid" | "Failed" | "Refunded";
  Payment_Method?: string;
  Delivery_Address: string;
  Delivery_Date?: Date | string;
  Notes?: string;
  Created_at?: Date | string;
  Updated_at?: Date | string;
  // Order items
  orderItems?: MedicineOrderItem[];
}

export interface MedicineOrderItem {
  Order_Item_id?: number;
  Order_id: number;
  Medicine_id: number;
  Quantity: number;
  Unit_Price: number;
  Total_Price: number;
  // Nested medicine data
  medicine?: {
    Medicine_id: number;
    Medicine_Name: string;
    Brand_Name: string;
    Category: string;
    Dosage: string;
    Description: string;
  };
}

export interface CreateMedicineOrderDto {
  Patient_id: number;
  Pharmacy_id: number;
  Prescription_id?: number;
  Total_Amount: number;
  Order_Status: string;
  Payment_Status: string;
  Payment_Method?: string;
  Delivery_Address: string;
  Delivery_Date?: Date | string;
  Notes?: string;
  orderItems: {
    Medicine_id: number;
    Quantity: number;
    Unit_Price: number;
    Total_Price: number;
  }[];
}
export interface CreateMedicineOrderItemDto {
  Medicine_id: number;
  Quantity: number;
  Unit_Price: number;
  Total_Price: number;
}
