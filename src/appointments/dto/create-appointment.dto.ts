import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Appointment_Type } from "../entities/appointment.entity";
import { Status } from "../entities/appointment.entity";
import { Payment_Status } from "../entities/appointment.entity";

export class CreateAppointmentDto {
    // @ApiProperty({ description: 'Unique appointment identifier.'})
    //     @IsNumber()
    //     @IsNotEmpty()
    //     Appointment_id: number;
    
        @ApiProperty({ description: 'Patient foreign key.'})
        @IsNumber()
        @IsNotEmpty()
        Patient_id: number;
    
        @ApiProperty({ description: 'Doctor foreign key.'})
        @IsNumber()
        @IsNotEmpty()
        Doctor_id: number;
    
        @ApiProperty({ description: 'Date for the appointment.'})
        @IsNotEmpty()
        Appointment_Date: Date;
    
        @ApiProperty({ description: 'Time for the appointment.'})
        @IsNotEmpty()
        Appointment_Time: Date;
    
        @ApiProperty({ description: 'Type of appointment.'})
        @IsNotEmpty()
        Appointment_Type: Appointment_Type;
    
        @ApiProperty({ description: 'Appointment Status.'})
        @IsNotEmpty()
        Status: Status;
    
        @ApiProperty({ description: 'Reason for visit.'})
        @IsString()
        @IsNotEmpty()
        Reason_For_Visit: string;
    
        @ApiProperty({ description: 'Notes by the doctor.'})
        @IsString()
        @IsNotEmpty()
        Notes: string;
    
        @ApiProperty({ description: 'Payment status.'})
        @IsNotEmpty()
        Payment_Status: Payment_Status;
    
        @ApiProperty({ description: 'Time the appointment was created.'})
        Created_at: Date;
    
        @ApiProperty({ description: 'Time the appointment was updated.'})
        Updated_at: Date;
}
