-- Migration script to update medicine_orders table
-- Run this manually in PostgreSQL

-- Step 1: Drop existing table if no important data exists
DROP TABLE IF EXISTS medicine_orders CASCADE;

-- Step 2: Create new medicine_orders table with correct structure
CREATE TABLE medicine_orders (
    "Medicine_Order_id" SERIAL PRIMARY KEY,
    "Patient_id" INTEGER NOT NULL,
    "Pharmacy_id" INTEGER NOT NULL,
    "Prescription_id" INTEGER NULL,
    "Order_Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Total_Amount" DECIMAL(10,2) NOT NULL,
    "Order_Status" VARCHAR(50) DEFAULT 'Pending',
    "Payment_Status" VARCHAR(50) DEFAULT 'Pending',
    "Payment_Method" VARCHAR(100) NULL,
    "Delivery_Address" TEXT NOT NULL,
    "Delivery_Date" DATE NULL,
    "Notes" TEXT NULL,
    "Created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create medicine_order_items table
CREATE TABLE medicine_order_items (
    "Order_Item_id" SERIAL PRIMARY KEY,
    "Order_id" INTEGER NOT NULL,
    "Medicine_id" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "Unit_Price" DECIMAL(10,2) NOT NULL,
    "Total_Price" DECIMAL(10,2) NOT NULL,
    FOREIGN KEY ("Order_id") REFERENCES medicine_orders("Medicine_Order_id") ON DELETE CASCADE
);

-- Step 4: Create indexes for better performance
CREATE INDEX idx_medicine_orders_patient ON medicine_orders("Patient_id");
CREATE INDEX idx_medicine_orders_pharmacy ON medicine_orders("Pharmacy_id");
CREATE INDEX idx_medicine_orders_date ON medicine_orders("Order_Date");
CREATE INDEX idx_medicine_order_items_order ON medicine_order_items("Order_id");
CREATE INDEX idx_medicine_order_items_medicine ON medicine_order_items("Medicine_id");
