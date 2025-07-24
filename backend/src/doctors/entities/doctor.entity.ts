import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { MedicalRecord } from '../../medical_records/entities/medical_record.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';
import { DoctorSchedule } from '../../doctor_schedule/entities/doctor_schedule.entity';


@Entity('doctors')
export class Doctor {
    @ApiProperty({ description: 'Unique Doctor identifier.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    Doctor_id: number;

    @ApiProperty({ description: 'User Id foreign Key.'})
    @Column({ type: 'int', nullable: false})
    User_id: number;

    @ApiProperty({ description: 'Doctor license number.'})
    @Column({ type: 'varchar', nullable: false})
    License_number: string;
    
    @ApiProperty({ description: 'Doctor Specialization.'})
    @Column({ type: 'varchar', nullable: false})
    Specialization: string;

    @ApiProperty({ description: 'Doctor qualification.'})
    @Column({ type: 'varchar', nullable: false})
    Qualification: string;

    @ApiProperty({ description: 'Doctor experience years.'})
    @Column({ type: 'int', nullable: false})
    Experience_Years: number;

    @ApiProperty({ description: 'Doctor department.'})
    @Column({ type: 'varchar', nullable: false})
    Department: string;

    @ApiProperty({ description: 'Doctors about.'})
    @Column({ type: 'text', nullable: false})
    Bio: string;

    @ApiProperty({ description: 'Languages spoken by the doctor.'})
    @Column({ type: 'varchar', nullable: false})
    Languages_Spoken: string;

    @ApiProperty({ description: 'Doctor availability online.'})
    @Column({ type: 'boolean', nullable: false})
    Is_Available_Online: boolean;

    @ApiProperty({ description: 'Doctor rating.'})
    @Column({ type: 'decimal', nullable: true})
    Rating: number;

    @ApiProperty({ description: 'Doctors consultation fee.'})
    @Column({ type: 'decimal', nullable: true})
    Consultation_Fee: number;

    @ApiProperty({ description: 'Doctor total reviews.'})
    @Column({ type: 'varchar', nullable: false})
    Reviews: string;

    @ApiProperty({description: 'Date the doctor account was created.'})
    @CreateDateColumn({ type: 'timestamp', name: 'created_at'})
    Created_at: Date;

    @ApiProperty({description: 'Date the doctor account was created.'})
    @CreateDateColumn({ type: 'timestamp', name: 'Updated_at'})
    Updated_at: Date;

    @OneToOne(() => User, user => user.doctor, {
        eager: true,
        onDelete: 'CASCADE',
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'User_id' })
    user: User;

    @OneToMany(() => Appointment, appointment => appointment.doctor)
    appointments: Appointment[];

    @OneToMany(() => MedicalRecord, record => record.doctor)
    medicalRecords: MedicalRecord[];

    @OneToMany(() => Prescription, prescription => prescription.doctor)
    prescriptions: Prescription[];

    @OneToMany(() => DoctorSchedule, schedule => schedule.doctor)
    schedules: DoctorSchedule[];
}
