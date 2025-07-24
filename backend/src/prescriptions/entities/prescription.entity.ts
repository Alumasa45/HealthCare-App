import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { PrescriptionItem } from '../../prescription_items/entities/prescription_item.entity';

export enum Status {
    Active = 'Active',
    Completed = 'Completed',
    Expired = 'Expired',
}

@Entity('prescriptions')
export class Prescription {
    @ApiProperty({ description: 'Unique identification for each prescription.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    Prescription_id: number;

    @ApiProperty({ description: 'Patient Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Patient_id: number;
    
    @ApiProperty({ description: 'Doctor Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Doctor_id: number;

    @ApiProperty({ description: 'Appointment Id foreign key.'})
    @Column({ type: 'int', nullable: true})
    Appointment_id:number;

    @ApiProperty({ description: 'Name of the medicine.'})
    @Column({ type: 'varchar', nullable: true})
    Medicine_Name: string;

    @ApiProperty({ description: 'Prescription number.'})
    @Column({ type: 'varchar', nullable: false})
    Prescription_Number: string;

    @ApiProperty({ description: 'Date os issuing.'})
    @Column({ type: 'date', nullable: false})
    Issue_Date: Date;

    @ApiProperty({ description: 'Validity period.'})
    @Column({ type: 'date', nullable: false})
    Validity_Period: Date;

    @ApiProperty({ description: 'Total amount for the items.'})
    @Column({ type: 'decimal', nullable: false})
    Total_Amount: number;

    @ApiProperty({ description: 'Status of the prescription.'})
    @Column({ type: 'enum', enum:Status})
    Status: Status;

    @ApiProperty({ description: 'Notes by the doctor.'})
    @Column({ type: 'varchar', nullable: false})
    Notes: string;

    @ApiProperty({ description: 'Date the prescription record was created.'})
    @CreateDateColumn({ type: 'date', name: 'Created_at'})
    Created_at: Date;

    @ApiProperty({ description: 'Date the prescription record was updated.'})
    @CreateDateColumn({ type: 'date', name: 'Updated_at'})
    Updated_at: Date;

    // Relationships
    @ManyToOne(() => Patient, patient => patient.prescriptions)
    @JoinColumn({ name: 'Patient_id' })
    patient: Patient;

    @ManyToOne(() => Doctor, doctor => doctor.prescriptions)
    @JoinColumn({ name: 'Doctor_id' })
    doctor: Doctor;

    @ManyToOne(() => Appointment, appointment => appointment.prescriptions)
    @JoinColumn({ name: 'Appointment_id' })
    appointment: Appointment;

    @OneToMany(() => PrescriptionItem, item => item.prescription)
    items: PrescriptionItem[];
}
