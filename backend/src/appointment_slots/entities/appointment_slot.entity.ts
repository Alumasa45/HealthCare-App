import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('appointment_slots')
export class AppointmentSlot {
    @ApiProperty({ description: 'Unique identification for the slot.'})
    @PrimaryGeneratedColumn({ type: 'int'})
    Slot_id: number;

    @ApiProperty({ description: 'Appointment Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Appointment_id: number;

    @ApiProperty({ description: 'Doctor Id foreign key.'})
    @Column({ type: 'int', nullable: false})
    Doctor_id: number;

    @ApiProperty({ description: 'Date with open slot.'})
    @Column({ type: 'date', nullable: false})
    Slot_Date: Date;

    @ApiProperty({ description: 'Time with open slot.'})
    @Column({ type: 'time', nullable: false})
    Slot_Time: Date;

    @ApiProperty({ description: 'Appointment availability.'})
    @Column({ type: 'boolean', nullable: false})
    Is_Available: boolean;

    @ApiProperty({ description: 'Shows if appointment is blocked.'})
    @Column({ type: 'boolean', nullable: true})
    Is_Blocked: boolean;

    @ApiProperty({ description: 'Time appointment was created.'})
    @CreateDateColumn({ type: 'date', name: 'Created_at'})
    Created_at: Date;
    
    @ApiProperty({ description: 'Time appointment was created.'})
    @CreateDateColumn({ type: 'date', name: 'Updated_at'})
    Updated_at: Date;
}
