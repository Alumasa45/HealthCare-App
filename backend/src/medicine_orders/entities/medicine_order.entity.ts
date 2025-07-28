import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Order_Status {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export enum Payment_Status {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
  Refunded = 'Refunded',
}

export enum Payment_Method {
  Cash = 'Cash',
  CreditCard = 'CreditCard',
  DebitCard = 'DebitCard',
  Online = 'Online',
  Insurance = 'Insurance',
}

@Entity('medicine_orders')
export class MedicineOrder {
  @ApiProperty({ description: 'Unique identification for each order.' })
  @PrimaryGeneratedColumn({ type: 'int' })
  Order_id: number;

  @ApiProperty({ description: 'Patient Id foreign key.' })
  @Column({ type: 'int', nullable: false })
  Patient_id: number;

  @ApiProperty({ description: 'Pharmacy Id foreign key.' })
  @Column({ type: 'int', nullable: false })
  Pharmacy_id: number;

  @ApiProperty({ description: 'Prescription Id foreign key.' })
  @Column({ type: 'int', nullable: true })
  Prescription_id?: number;

  @ApiProperty({ description: 'Date of order.' })
  @CreateDateColumn()
  Order_Date: Date;

  @ApiProperty({ description: 'Total amount for the order.' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  Total_Amount: number;

  @ApiProperty({ description: 'Status of the order.' })
  @Column({ type: 'enum', enum: Order_Status, default: Order_Status.Pending })
  Order_Status: Order_Status;

  @ApiProperty({ description: 'Payment status.' })
  @Column({
    type: 'enum',
    enum: Payment_Status,
    default: Payment_Status.Pending,
  })
  Payment_Status: Payment_Status;

  @ApiProperty({ description: 'Payment method.' })
  @Column({ type: 'varchar', nullable: true })
  Payment_Method?: string;

  @ApiProperty({ description: 'Delivery address.' })
  @Column({ type: 'text', nullable: false })
  Delivery_Address: string;

  @ApiProperty({ description: 'Expected delivery date.' })
  @Column({ type: 'date', nullable: true })
  Delivery_Date?: Date;

  @ApiProperty({ description: 'Special notes or instructions.' })
  @Column({ type: 'text', nullable: true })
  Notes?: string;

  @ApiProperty({ description: 'Record creation timestamp.' })
  @CreateDateColumn()
  Created_at: Date;

  @ApiProperty({ description: 'Record update timestamp.' })
  @UpdateDateColumn()
  Updated_at: Date;
}
