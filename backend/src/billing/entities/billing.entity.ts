import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';
import { MedicineOrder } from '../../medicine_orders/entities/medicine_order.entity';

export enum PaymentStatus {
  Paid = 'Paid',
  Pending = 'Pending',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled',
}

export enum PaymentMethod {
  Cash = 'Cash',
  Card = 'Card',
  Insurance = 'Insurance',
  Mobile_Money = 'Mobile Money',
}

@Entity('billing')
export class Bill {
  @ApiProperty({ description: 'Unique bill identifier.' })
  @PrimaryGeneratedColumn({ type: 'int' })
  Bill_id: number;

  @ApiProperty({ description: 'Patient ID foreign key.' })
  @Column({ type: 'int', nullable: false })
  Patient_id: number;

  @ApiProperty({ description: 'Appointment ID foreign key.' })
  @Column({ type: 'int', nullable: true })
  Appointment_id?: number;

  @ApiProperty({ description: 'Prescription ID foreign key.' })
  @Column({ type: 'int', nullable: true })
  Prescription_id?: number;

  @ApiProperty({ description: 'Order ID foreign key.' })
  @Column({ type: 'int', nullable: true })
  Order_id?: number;

  @ApiProperty({ description: 'Date the bill was issued.' })
  @Column({ type: 'date', nullable: false })
  Bill_Date: Date;

  @ApiProperty({ description: 'Due date for payment.' })
  @Column({ type: 'date', nullable: false })
  Due_Date: Date;

  @ApiProperty({ description: 'Base amount before tax and discounts.' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  Amount: number;

  @ApiProperty({ description: 'Tax amount.' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  Tax_Amount: number;

  @ApiProperty({ description: 'Discount amount.' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, default: 0 })
  Discount_Amount: number;

  @ApiProperty({ description: 'Total amount after tax and discounts.' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  Total_Amount: number;

  @ApiProperty({ description: 'Payment status.' })
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.Pending })
  Payment_Status: PaymentStatus;

  @ApiProperty({ description: 'Payment method.' })
  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  Payment_Method?: PaymentMethod;

  @ApiProperty({ description: 'Date of payment.' })
  @Column({ type: 'date', nullable: true })
  Payment_Date?: Date;

  @ApiProperty({ description: 'Description of the bill.' })
  @Column({ type: 'text', nullable: false })
  Description: string;

  @ApiProperty({ description: 'Time the bill was created.' })
  @CreateDateColumn({ type: 'timestamp', name: 'Created_at' })
  Created_at: Date;

  @ApiProperty({ description: 'Time the bill was updated.' })
  @CreateDateColumn({ type: 'timestamp', name: 'Updated_at' })
  Updated_at: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'Patient_id' })
  patient: User;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'Appointment_id' })
  appointment?: Appointment;

  @ManyToOne(() => Prescription, { nullable: true })
  @JoinColumn({ name: 'Prescription_id' })
  prescription?: Prescription;

  @ManyToOne(() => MedicineOrder, { nullable: true })
  @JoinColumn({ name: 'Order_id' })
  order?: MedicineOrder;
}