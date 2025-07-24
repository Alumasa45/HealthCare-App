import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('invoices')
export class Invoice {
  @ApiProperty({ description: 'Unique invoice identifier.' })
  @PrimaryGeneratedColumn({ type: 'int' })
  invoice_id: number;

  @ApiProperty({ description: 'Invoice number for reference.' })
  @Column({ type: 'varchar', unique: true })
  invoice_number: string;

  @ApiProperty({ description: 'Patient ID foreign key.' })
  @Column({ type: 'int', nullable: false })
  patient_id: number;

  @ApiProperty({ description: 'Doctor ID foreign key.' })
  @Column({ type: 'int', nullable: false })
  doctor_id: number;

  @ApiProperty({ description: 'Appointment ID foreign key.' })
  @Column({ type: 'int', nullable: false })
  appointment_id: number;

  @ApiProperty({ description: 'Consultation fee amount.' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  consultation_fee: number;

  @ApiProperty({ description: 'Tax amount (if applicable).' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @ApiProperty({ description: 'Total amount including tax.' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  total_amount: number;

  @ApiProperty({ description: 'Invoice status.' })
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @ApiProperty({ description: 'Due date for payment.' })
  @Column({ type: 'date', nullable: false })
  due_date: Date;

  @ApiProperty({ description: 'Date when invoice was issued.' })
  @Column({ type: 'date', nullable: false })
  issue_date: Date;

  @ApiProperty({ description: 'Payment date (when paid).' })
  @Column({ type: 'date', nullable: true })
  payment_date?: Date;

  @ApiProperty({ description: 'Paystack reference for payment tracking.' })
  @Column({ type: 'varchar', nullable: true })
  paystack_reference?: string;

  @ApiProperty({ description: 'Invoice description/notes.' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Date the invoice was created.' })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Date the invoice was updated.' })
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
