import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, OneToOne } from "typeorm";
import { Address } from '../../addresses/entities/address.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Pharmacy } from '../../pharmacies/entities/pharmacy.entity';


export enum User_Type {
    Patient = 'Patient',
    Doctor = 'Doctor',
    Pharmacist = 'Pharmacist',
    Admin = 'Admin',
}

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other',
}

export enum Account_Status {
    Active = 'Active',
    InActive = 'InActive',
}

@Entity('users')
export class User {
    @ApiProperty({description: 'Unique User Identification number.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    User_id: number;

    @ApiProperty({description: 'Users email.'})
    @Column({ type: 'varchar', nullable: true})
    Email: string;

    @ApiProperty({description: 'Users password.'})
    @Column({ type: 'varchar', nullable: false})
    Password: string;

    @ApiProperty({description: 'Users phone number.'})
    @Column({ type: 'varchar', nullable: false})
    Phone_Number: string;

    @ApiProperty({description: 'User type.'})
    @Column({ type: 'enum', enum: User_Type, default: User_Type.Patient })
    User_Type: User_Type;

    @ApiProperty({description: 'Users first name.'})
    @Column({ type: 'varchar', nullable: false})
    First_Name: string;

    @ApiProperty({description: 'Users last name.'})
    @Column({ type: 'varchar', nullable: false})
    Last_Name: string;

    @ApiProperty({description: 'Users date of Birth.'})
    @Column({ type: 'date', nullable: false})
    Date_of_Birth: Date;

    @ApiProperty({description: 'Users gender.'})
    @Column({ type: 'enum', enum: Gender})
    Gender: Gender;

    @Column({ nullable: true})
    hashedRefreshToken?: string;

    // @ApiProperty({description: 'Link to users profile.'})
    // @Column({ type: 'varchar', nullable: false})
    // Profile_image?: string;

    @ApiProperty({description: 'Describes account status, whether it is active or inactive.'})
    @Column({ type: 'enum', enum: Account_Status, default: Account_Status.Active})
    Account_Status: Account_Status

    @ApiProperty({description: 'Date the user was created.'})
    @CreateDateColumn({ type: 'timestamp', name: 'created_at'})
    Created_at?: Date;

    @OneToMany(() => Address, address => address.user)
    addresses: Address[];

    @OneToOne(() => Patient, patient => patient.user)
    patient: Patient;

    @OneToOne(() => Doctor, doctor => doctor.user, {
        createForeignKeyConstraints: false
    })
    doctor: Doctor;

    @OneToOne(() => Pharmacy, pharmacy => pharmacy.user)
    pharmacy: Pharmacy;
}
