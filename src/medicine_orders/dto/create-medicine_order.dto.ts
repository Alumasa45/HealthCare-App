import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Order_Type } from "../entities/medicine_order.entity";
import { Payment_Method } from "../entities/medicine_order.entity";
import { Payment_Status } from "../entities/medicine_order.entity";
import { Order_Status } from "../entities/medicine_order.entity";


export class CreateMedicineOrderDto {
    // @ApiProperty({ description: 'Unique identification for each order.'})
    //     @IsNotEmpty()
    //     @IsNumber()
    //     Order_id: number;
    
        @ApiProperty({ description: 'Patient Id foreign key.'})
        @IsNotEmpty()
        @IsNumber()
        Patient_id: number;
    
        @ApiProperty({ description: 'Pharmacy Id foreign key.'})
        @IsNumber()
        @IsNotEmpty()
        Pharmacy_id: number;
    
        @ApiProperty({ description: 'Prescription Id foreign key.'})
        @IsNumber()
        @IsNotEmpty()
        Prescription_id: number;
    
        @ApiProperty({ description: 'Order number.'})
        @IsString()
        @IsNotEmpty()
        Order_Number: string;
    
        @ApiProperty({ description: 'Date of order.'})
        @IsNotEmpty()
        Order_Date: Date;
    
        @ApiProperty({ description: 'Type of order.'})
        @IsNotEmpty()
        Order_Type : Order_Type;
    
        @ApiProperty({ description: 'Subtotal for the order.'})
        @IsNumber()
        @IsNotEmpty()
        Subtotal: number;
    
        @ApiProperty({ description: 'Charges for delivery.'})
        @IsNumber()
        @IsNotEmpty()
        Delivery_Charges: number;
    
        @ApiProperty({ description: 'Tax amount.'})
        @IsNumber()
        Tax_Amount: number;
    
        @ApiProperty({ description: 'Total amount for the order.'})
        @IsNumber()
        @IsNotEmpty()
        Total_Amount: number;
    
        @ApiProperty({ description: 'Method of payment.'})
        @IsNotEmpty()
        Payment_Method: Payment_Method;
    
        @ApiProperty({ description: 'Payment status.'})
        @IsNotEmpty()
        Payment_Status: Payment_Status;
    
        @ApiProperty({ description: 'Status of the order.'})
        @IsNotEmpty()
        Order_Status: Order_Status;
    
        @ApiProperty({ description: 'Address for delivery.'})
        @IsString()
        @IsNotEmpty()
        Delivery_Address: string;
    
        @ApiProperty({ description: 'Instructions for delivery.'})
        @IsString()
        Delivery_Instructions: string;
    
        @ApiProperty({ description: 'Estimated delivery time.'})
        Estimated_Delivery: Date;
    
        @ApiProperty({ description: 'Time order details were logged into the system.'})
        Created_at: Date;
    
        @ApiProperty({ description: 'Time order details were updated.'})
        Updated_at: Date;
}
