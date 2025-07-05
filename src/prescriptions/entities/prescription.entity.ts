import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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
    @Column({ type: 'int', nullable: false})
    Appointment_id:number;

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
}
