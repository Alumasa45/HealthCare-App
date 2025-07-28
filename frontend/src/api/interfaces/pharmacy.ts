export interface PharmacyInventory {
  Inventory_id?: number;
  Pharmacy_id: number;
  Medicine_id: number;
  Batch_Number: string;
  Expiry_Date: Date | string;
  Stock_Quantity: number;
  Unit_Price: number;
  Supplier_Name: string;
  Purchase_Date: Date | string;
  Created_at?: Date | string;
  Updated_at?: Date | string;
  medicine?: {
    Medicine_id: number;
    Medicine_Name: string;
    Brand_Name: string;
    Manufacturer: string;
    Category: string;
    Dosage: string;
    Strength: string;
    Description: string;
    Side_Effects: string;
    Storage_Instructions: string;
    Image_url?: string;
  };

  pharmacy?: {
    Pharmacy_id: number;
    Pharmacy_Name: string;
    Location: string;
    Contact_Number: string;
    Email: string;
  };
}

export interface CreatePharmacyInventoryDto {
  Pharmacy_id: number;
  Medicine_id: number;
  Batch_Number: string;
  Expiry_Date: Date | string;
  Stock_Quantity: number;
  Unit_Price: number;
  Supplier_Name: string;
  Purchase_Date: Date | string;
}

export interface Product {
  Product_id: number;
  Product_name: string;
  Category: string;
  Price: number;
  OriginalPrice?: number;
  DiscountPrice?: number;
  Rating: number;
  Image_url: string;
  Brand: string;
  Description: string;
}

export interface CartItem {
  id: string;
  inventory: PharmacyInventory;
  quantity: number;
  totalPrice: number;
  Purchase_Date?: Date | string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface FilterOptions {
  categories: string[];
  priceRange: { min: number; max: number };
  brands: string[];
  searchTerm: string;
  sortBy: "name" | "price_low" | "price_high" | "rating" | "expiry";
}

export interface PharmacyFilters {
  category: string;
  priceRange: string;
  brand: string;
  inStock: boolean;
}
