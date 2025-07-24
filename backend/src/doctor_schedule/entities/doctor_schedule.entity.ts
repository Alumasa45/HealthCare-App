import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Doctor } from '../../doctors/entities/doctor.entity';



export enum Day_Of_The_Week {
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
    Sunday = 'Sunday',
}

@Entity('doctor_schedule')
export class DoctorSchedule {
    @ApiProperty({ description: 'Unique identifier for the schedule.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    Schedule_id: number;

    @ApiProperty({ description: 'Doctor Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Doctor_id: number;

    @ApiProperty({ description: 'Day of the week.'})
    @Column({ type: 'enum', enum: Day_Of_The_Week})
    Day_Of_The_Week: Day_Of_The_Week;

    @ApiProperty({ description: 'Time when the doctors shift starts'})
    @Column({ type: 'time'})
    Start_Time: Date;

    @ApiProperty({ description: 'Time when the doctors shift ends'})
    @Column({ type: 'time'})
    End_Time: Date;

    @ApiProperty({ description: 'Time the slot takes.'})
    @Column({ type: 'int', nullable: false})
    Slot_Duration: number;

    @ApiProperty({ description: 'Activity status.'})
    @Column({ type: 'boolean'})
    Is_Active: Boolean;

    @ApiProperty({ description: 'Time the schedule was created.'})
    @CreateDateColumn({ type: 'date', name: 'Created_at'})
    Created_at: Date;
    
    @ApiProperty({ description: 'Time the schedule was updated.'})
    @CreateDateColumn({ type: 'date', name: 'Updated_at'})
    Updated_at: Date;

    // Relationships
    @ManyToOne(() => Doctor, doctor => doctor.schedules, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: 'Doctor_id' })
    doctor: Doctor;

}
