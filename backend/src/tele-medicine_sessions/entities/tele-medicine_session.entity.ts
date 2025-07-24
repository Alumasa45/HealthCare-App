import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('tele-medicine_sessions')
export class TeleMedicineSession {
@ApiProperty({ description: 'Unique session identifier number.'})
@PrimaryGeneratedColumn({ type: 'int'})
Session_id: number;

@ApiProperty({ description: 'Appointment Id foreign key'})
@Column({ type: 'int', nullable: false})
Appointment_id: number;

@ApiProperty({ description: 'Patient Id foreign key'})
@Column({ type: 'int', nullable: false})
Patient_id: number;

@ApiProperty({ description: 'Doctor Id foreign key'})
@Column({ type: 'int', nullable: false})
Doctor_id: number;
}
