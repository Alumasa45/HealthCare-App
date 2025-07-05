import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePharmacyInventoryDto {
        // @ApiProperty({ description: 'Unique identification for each inventory.'})
        // @IsNotEmpty()
        // @IsNumber()
        // Inventory_id: number;
    
        @ApiProperty({ description: 'Pharmacy Id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        Pharmacy_id: number;
    
        @ApiProperty({ description: 'Medicine Id foreign key.'})
        @IsNumber()
        @IsNotEmpty()
        Medicine_id: number;
    
        @ApiProperty({ description: 'Batch number for the items.'})
        @IsNotEmpty()
        @IsString()
        Batch_Number: string;
    
        @ApiProperty({ description: 'Expiry date for the medicines.'})
        @IsNotEmpty()
        Expiry_Date: Date;
    
        @ApiProperty({ description: 'Total stock quantity.'})
        @IsNotEmpty()
        Stock_Quantity: number;
    
        @ApiProperty({ description: 'Unit price for each items.'})
        @IsNotEmpty()
        @IsNumber()
        Unit_Price: number;
    
        @ApiProperty({ description: 'Wholesale price for items.'})
        @IsNotEmpty()
        @IsNumber()
        Wholesale_Price: number;
    
        @ApiProperty({ description: 'Supplier name.'})
        @IsString()
        @IsNotEmpty()
        Supplier_Name: string;
    
        @ApiProperty({ description: 'Date the items were last restocked.'})
        @IsNotEmpty()
        Last_Restocked: Date;
    
        @ApiProperty({ description: 'Date the inventory was created.'})
        Created_at: Date;
    
        @ApiProperty({ description: 'Date the inventory was created.'})
        Updated_at: Date;
}
