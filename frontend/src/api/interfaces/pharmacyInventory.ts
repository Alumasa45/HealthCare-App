export interface PharmacyInventory {
  Inventory_id?: number;
  Pharmacy_id: number;
  Medicine_id: number;
  Batch_Number: string;
  Expiry_Date: Date | string;
  Stock_Quantity: number;
  Unit_Price: number;
  Wholesale_Price: number;
  Supplier_Name: string;
  Last_Restocked: Date | string;
  Created_at?: Date | string;
  Updated_at?: Date | string;
  medicine?: {
    Medicine_id: number;
    Medicine_Name: string;
    Brand_Name: string;
    Category: string;
    Dosage: string;
  };
}

export interface CreatePharmacyInventoryDto {
  Pharmacy_id: number;
  Medicine_id: number;
  Batch_Number: string;
  Expiry_Date: Date | string;
  Stock_Quantity: number;
  Unit_Price: number;
  Wholesale_Price: number;
  Supplier_Name: string;
  Last_Restocked: Date | string;
}

export interface UpdatePharmacyInventoryDto {
  Batch_Number?: string;
  Expiry_Date?: Date | string;
  Stock_Quantity?: number;
  Unit_Price?: number;
  Wholesale_Price?: number;
  Supplier_Name?: string;
  Last_Restocked?: Date | string;
}