import { ApiProperty } from "@nestjs/swagger";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { MedicalRecord } from '../../medical_records/entities/medical_record.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';

export enum Blood_Group {
    APositive = 'A+',
    ANegative = 'A-',
    BPositive = 'B+',
    BNegative = 'B-',
    ABPositive = 'AB+',
    ABNegative = 'AB-',
    OPositive = 'O+',
    ONegative = 'O-'
}

@Entity('patients')
export class Patient {
    @ApiProperty({ description: 'Unique patient identification number.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    Patient_id: number;

    @ApiProperty({ description: 'User id foreign key.'})
    @Column({ type: 'int', nullable: false})
    User_id: number;

    @ApiProperty({ description: 'Emergency contact name.'})
    @Column({ type: 'varchar', nullable: false})
    Emergency_Contact_Name: string;

    @ApiProperty({ description: 'Emergency contact phone number.'})
    @Column({ type: 'varchar', nullable: false})
    Emergency_Contact_Phone: string;

    @ApiProperty({ description: 'Emergency contact relationship.'})
    @Column({ type: 'varchar', nullable: false})
    Emergency_Contact_Relationship: string;

    @ApiProperty({ description: 'Patient blood group.'})
    @Column({ type: 'enum', enum:Blood_Group })
    Blood_Group: Blood_Group;
    
    @ApiProperty({ description: 'Patient height.'})
    @Column({ type: 'decimal', nullable: false})
    Height: number;

    @ApiProperty({ description: 'Patient weight.'})
    @Column({ type: 'decimal', nullable: false})
    Weight: number;

    @ApiProperty({ description: 'Patient allergies.'})
    @Column({ type: 'text', nullable: true})
    Allergies: string;

    @ApiProperty({ description: 'Patient chronic conditions.'})
    @Column({ type: 'text', nullable: true})
    Chronic_Conditions: string;

    @ApiProperty({ description: 'Patient Insurance provider.'})
    @Column({ type: 'varchar', nullable: true})
    Insurance_Provider: string;

    @ApiProperty({ description: 'Patient Insurance policy number.'})
    @Column({ type: 'varchar', nullable: true})
    Insurance_Policy_Number: string;

    @ApiProperty({ description: 'Time patient was added.'})
    @CreateDateColumn({ type: 'timestamp', name: 'Created_at'})
    Created_at: Date;

    @ApiProperty({ description: 'Time patient details were updated.'})
    @CreateDateColumn({ type: 'timestamp', name: 'Updated_at'})
    Updated_at: Date;

    // Relationships
    @OneToOne(() => User, user => user.patient)
    @JoinColumn({ name: 'User_id' })
    user: User;

    @OneToMany(() => Appointment, appointment => appointment.patient)
    appointments: Appointment[];

    @OneToMany(() => MedicalRecord, record => record.patient)
    medicalRecords: MedicalRecord[];

    @OneToMany(() => Prescription, prescription => prescription.patient)
    prescriptions: Prescription[];
}
