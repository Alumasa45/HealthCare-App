import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('medical_records')
export class MedicalRecord {
    @ApiProperty({ description: 'Unique medical record identifier.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    Record_id: number;

    @ApiProperty({ description: 'Patient Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Patient_id: number;

    @ApiProperty({ description: 'Doctor Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Doctor_id: number;
    
    @ApiProperty({ description: 'The date the patient visited.'})
    @Column({ type: 'date', nullable: false})
    Visit_Date: Date;

    @ApiProperty({ description: 'Patient diagnosis.'})
    @Column({ type: 'varchar', nullable: false})
    Diagnosis: string;

    @ApiProperty({ description: 'Patient symptoms.'})
    @Column({ type: 'text', nullable: false})
    Symptoms: string;

    @ApiProperty({ description: 'Treatment plan followed.'})
    @Column({ type: 'text', nullable: false})
    Treatment_Plan: string;

    @ApiProperty({ description: 'Notes given by the attending doctor.'})
    @Column({ type: 'text', nullable: false})
    Notes: string;

    @ApiProperty({ description: 'Describes whether follow up is required.'})
    @Column({ type: 'boolean', nullable: false})
    Follow_Up_Required: boolean;

    @ApiProperty({ description: 'Follow up date.'})
    @Column({ type: 'date', nullable: true})
    Follow_Up_Date: Date;

    @ApiProperty({description: 'Date the medical record was created.'})
    @CreateDateColumn({ type: 'timestamp', name: 'Created_at'})
    Created_at: Date;

    @ApiProperty({description: 'Date the medical record was updated.'})
    @CreateDateColumn({ type: 'timestamp', name: 'Updated_at'})
    Updated_at: Date;

}

