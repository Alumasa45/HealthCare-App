import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Appointment_Type } from "../entities/appointment.entity";
import { Status } from "../entities/appointment.entity";
import { Payment_Status } from "../entities/appointment.entity";

export class CreateAppointmentDto {

        @ApiProperty({ description: 'Patient foreign key.', example: 1 })
        @Transform(({ value }) => parseInt(value))
        @IsNumber()
        @IsNotEmpty()
        Patient_id: number;
    
        @ApiProperty({ description: 'Doctor foreign key.', example: 1 })
        @Transform(({ value }) => parseInt(value))
        @IsNumber()
        @IsNotEmpty()
        Doctor_id: number;
    
        @ApiProperty({ description: 'Date for the appointment.', example: '2025-07-20' })
        @IsNotEmpty()
        Appointment_Date: string;
    
        @ApiProperty({ description: 'Time for the appointment.', example: '10:00:00' })
        @IsNotEmpty()
        Appointment_Time: string;
    
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
}
