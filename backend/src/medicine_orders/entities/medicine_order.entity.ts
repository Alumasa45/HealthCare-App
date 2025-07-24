import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


export enum Order_Type {
    Prescription = 'Prescription',
    Otc = 'Over the counter',
    Refill = 'Refill'
}

export enum Payment_Method {
    cash = 'Cash',
    Card = 'Card',
    Mobile_Money = 'Mobile Money',
    Insurance = 'Insurance',
}

export enum Payment_Status {
    Pending = 'Pending',
    Paid = 'Paid',
    Failed = 'Failed',
    Refunded = 'Refunded',
}

export enum Order_Status {
    Placed = 'Placed',
    Confirmed = 'Confirmed',
    Preparing = 'Preparing',
    Ready = 'Ready',
    Dispatched = 'Dispatched',
    Delivered = 'Delivered',
    Cancelled = 'Cancelled',
}

@Entity('medicine_orders')
export class MedicineOrder {
    @ApiProperty({ description: 'Unique identification for each order.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    Order_id: number;

    @ApiProperty({ description: 'Patient Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Patient_id: number;

    @ApiProperty({ description: 'Pharmacy Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Pharmacy_id: number;

    @ApiProperty({ description: 'Prescription Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Prescription_id: number;

    @ApiProperty({ description: 'Order number.'})
    @Column({ type: 'varchar', nullable: false})
    Order_Number: string;

    @ApiProperty({ description: 'Date of order.'})
    @Column({ type: 'date', nullable: false})
    Order_Date: Date;

    @ApiProperty({ description: 'Type of order.'})
    @Column({ type: 'enum', enum: Order_Type})
    Order_Type : Order_Type;

    @ApiProperty({ description: 'Subtotal for the order.'})
    @Column({ type: 'decimal', nullable: false})
    Subtotal: number;

    @ApiProperty({ description: 'Charges for delivery.'})
    @Column({ type: 'decimal', nullable: false})
    Delivery_Charges: number;

    @ApiProperty({ description: 'Tax amount.'})
    @Column({ type: 'decimal', nullable: false})
    Tax_Amount: number;

    @ApiProperty({ description: 'Total amount for the order.'})
    @Column({ type: 'decimal', nullable: false})
    Total_Amount: number;

    @ApiProperty({ description: 'Method of payment.'})
    @Column({ type: 'enum', enum:Payment_Method})
    Payment_Method: Payment_Method;

    @ApiProperty({ description: 'Payment status.'})
    @Column({ type: 'enum', enum:Payment_Status})
    Payment_Status: Payment_Status;

    @ApiProperty({ description: 'Status of the order.'})
    @Column({ type: 'enum', enum: Order_Status})
    Order_Status: Order_Status;

    @ApiProperty({ description: 'Address for delivery.'})
    @Column({ type: 'text', nullable: false})
    Delivery_Address: string;

    @ApiProperty({ description: 'Instructions for delivery.'})
    @Column({ type: 'text', nullable: false})
    Delivery_Instructions: string;

    @ApiProperty({ description: 'Estimated delivery time.'})
    @CreateDateColumn({type: 'timestamp'})
    Estimated_Delivery: Date;

    @ApiProperty({ description: 'Time order details were logged into the system.'})
    @CreateDateColumn({type: 'date', name: 'Created_at'})
    Created_at: Date;

    @ApiProperty({ description: 'Time order details were updated.'})
    @CreateDateColumn({type: 'date', name: 'Updated_at'})
    Updated_at: Date;

}
