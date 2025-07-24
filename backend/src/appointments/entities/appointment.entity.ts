import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';

export enum Appointment_Type {
  In_Person = 'In-Person',
  TeleMedicine = 'TeleMedicine',
  Follow_up = 'Follow-Up',
}

export enum Status {
  Scheduled = 'Scheduled',
  Confirmed = 'Confirmed',
  In_Progress = 'In Progress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  No_Show = 'No Show',
}

export enum Payment_Status {
  pending = 'Transaction Pending',
  Paid = 'Paid',
}

@Entity('appointments')
export class Appointment {
  @ApiProperty({ description: 'Unique appointment identifier.' })
  @PrimaryGeneratedColumn({ type: 'int' })
  Appointment_id: number;

  @ApiProperty({ description: 'Patient foreign key.' })
  @Column({ type: 'int', nullable: false })
  Patient_id: number;

  @ApiProperty({ description: 'Doctor foreign key.' })
  @Column({ type: 'int', nullable: false })
  Doctor_id: number;

  @ApiProperty({ description: 'Date for the appointment.' })
  @Column({ type: 'date', nullable: false })
  Appointment_Date: Date;

  @ApiProperty({ description: 'Time for the appointment.' })
  @Column({ type: 'time', nullable: false })
  Appointment_Time: Date;

  @ApiProperty({ description: 'Type of appointment.' })
  @Column({ type: 'enum', enum: Appointment_Type })
  Appointment_Type: Appointment_Type;

  @ApiProperty({ description: 'Appointment Status.' })
  @Column({ type: 'enum', enum: Status, default: Status.In_Progress })
  Status: Status;

  @ApiProperty({ description: 'Reason for visit.' })
  @Column({ type: 'text', nullable: false })
  Reason_For_Visit: string;

  @ApiProperty({ description: 'Notes by the doctor.' })
  @Column({ type: 'text', nullable: false })
  Notes: string;

  @ApiProperty({ description: 'Payment status.' })
  @Column({
    type: 'enum',
    enum: Payment_Status,
    default: Payment_Status.pending,
  })
  Payment_Status: Payment_Status;

  @ApiProperty({ description: 'Time the appointment was created.' })
  @Column({ type: 'time', name: 'Created_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  Created_at?: Date;

  @ApiProperty({ description: 'Time the appointment was updated.' })
  @Column({ type: 'time', name: 'Updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  Updated_at?: Date;

  //relationships.
  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn({ name: 'Patient_id' })
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments)
  @JoinColumn({ name: 'Doctor_id' })
  doctor: Doctor;

  @OneToMany(() => Prescription, (prescription) => prescription.appointment)
  prescriptions: Prescription[];
}
